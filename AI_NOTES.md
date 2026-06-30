# AI_NOTES.md

## 1. Which AI Tools and Models Used

**Primary tool:** Antigravity (Google DeepMind agentic coding assistant) running Gemini 2.5 Pro / Claude Sonnet 4.6 depending on the task.

**How work was split:**

| Task | Who did it |
|---|---|
| System architecture design (event-driven pipeline, DB schema) | Me (Naveen) |
| Scaffolding boilerplate files (route handlers, Prisma schema) | AI |
| Key infrastructure decisions (pgbouncer, Vercel await pattern) | Me — I identified the bugs; AI helped implement fixes |
| Dashboard and landing page UI code | AI (with my direction on design and content) |
| Debugging production errors from Vercel logs | Me (reading logs, diagnosing root cause); AI (writing fixes) |
| Writing tests/verification | Me |
| AI_NOTES, README, commit messages | Collaborative |

---

## 2. Three Key Decisions I Made Myself

**a) Two-API architecture for the webhook pipeline**  
I chose to split the webhook into two API routes: `/api/webhooks/github` (receives and saves) and `/api/process-event` (processes with AI). This was a deliberate design decision — the receiver can return `202 Accepted` immediately to GitHub (which has a 10-second timeout), while the heavier AI work happens in a second call. AI initially suggested doing everything in one route, which would have caused GitHub to mark deliveries as failed.

**b) Supabase Transaction Pooler (port 6543) instead of Direct (port 5432)**  
I knew Vercel's serverless runtime only routes IPv4, and Supabase's direct connection (port 5432) was IPv6 only on their free tier. I specifically chose port 6543 (the PgBouncer transaction pooler) which is IPv4-compatible. AI was not aware of this Vercel/Supabase incompatibility and would have used the default direct connection URL from the Supabase dashboard.

**c) GitHub App over GitHub OAuth App**  
I chose a GitHub App (not a plain OAuth App) because it can act as an installation — posting comments, receiving webhooks per-repo, and using installation tokens. This is the correct architecture for a bot that operates on behalf of multiple users across different repos. AI defaulted toward suggesting a simpler OAuth App when I first described the project.

---

## 3. The Hardest Bug — What the AI Got Wrong

**The bug:** After deploying to Vercel, creating GitHub issues produced a `202 Accepted` response from the webhook endpoint, and the GitHub delivery log showed green checkmarks — but nothing appeared on the dashboard, and no AI comments were posted to GitHub.

**What the AI got wrong:** The AI initially designed the webhook to use a "fire and forget" pattern:
```typescript
// AI's original code — BROKEN on Vercel
processEventBackground(newEvent.id).catch(err => console.error(err));
return NextResponse.json({ message: 'Event received' }, { status: 202 });
```
This works perfectly in a traditional Node.js server with a persistent process. But on Vercel's serverless platform, the moment a response is sent (`return NextResponse.json`), Vercel **immediately freezes and then tears down the container**. The background promise is killed mid-execution — after the DB write but before the Gemini API call or GitHub comment. The AI did not account for this fundamental difference between serverless and traditional server environments.

**How I noticed:** I saw events in the database with status `PENDING` but no `processedAt` timestamp and no action logs — meaning the event was saved but processing never ran. I manually called `/api/process-event` via curl, which succeeded instantly. This proved the processor worked but was never being reached from the webhook.

**How I fixed it:** I changed the webhook to `await` the processor before returning, forcing Vercel to keep the container alive until all work completes:
```typescript
// Fixed — Vercel keeps container alive until this resolves
await processEventBackground(newEvent.id);
return NextResponse.json({ message: 'Event received' }, { status: 202 });
```

---

## 4. The Second Hardest Bug — Also AI's Fault

**The bug:** `prepared statement "s7" already exists` — a Postgres error crashing every login attempt after the first one in production.

**Root cause:** Using Supabase's PgBouncer pooler (port 6543) requires Prisma to be told it is talking to a pooler. Without `?pgbouncer=true` in the connection string, Prisma uses named prepared statements. PgBouncer routes each query to a potentially different Postgres backend, causing the prepared statement names to collide across connections.

**Fix:** Append `?pgbouncer=true` to the DATABASE_URL.

The AI used a standard Prisma connection string. This is a known gotcha specific to the Supabase + Vercel + Prisma combination that is not documented clearly in any single place.

---

## 5. What I'd Improve With More Time

- **In-app configuration UI** — Currently users must clone the repo and configure their own API keys. A proper SaaS version would have an onboarding flow where users paste their keys into the UI.
- **PR summarization** — Summarize pull request diffs, not just issues
- **AI label classification** — Auto-apply labels (`bug`, `feature`, `question`) based on issue content
- **Configurable rules per repo** — Let users define custom automation rules per repository through the dashboard UI (the DB schema already has a `Rule` model ready for this)
- **Real-time dashboard updates** — Use Server-Sent Events or WebSockets so the activity log updates live without a page refresh

---

## 6. AI Context / Instruction Files

- `AGENTS.md` — behavioral instructions for the AI assistant (tool preferences, code style)
- `CLAUDE.md` — minimal notes left from initial scaffolding phase

---

## Technical Architecture Reference

```
GitHub Webhook
     │
     ▼
/api/webhooks/github
  1. Verify HMAC-SHA256 signature
  2. Idempotency check (X-GitHub-Delivery)
  3. Save event to DB (status: PENDING)
  4. AWAIT /api/process-event ← critical for Vercel
     │
     ▼
/api/process-event
  1. Fetch event from DB
  2. Call Gemini AI → generate 2-3 sentence summary
  3. Post comment to GitHub issue (via Octokit installation token)
  4. Send Slack notification (if SLACK_WEBHOOK_URL is set)
  5. Update event status → PROCESSED
  6. Create ActionLog entry
     │
     ▼
Dashboard (/dashboard)
  - All queries scoped to session.user.id
  - Shows: stats, live activity log, integration status, connected repos
```
