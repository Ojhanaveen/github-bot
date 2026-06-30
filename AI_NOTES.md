# AI Integration Notes

## Overview

This project uses the **Google Gemini API** (`gemini-2.5-flash` model) to provide AI-powered summarization of GitHub issues, automatically posting summaries as comments on GitHub and notifying teams via Slack.

## Architecture

```
GitHub Webhook → /api/webhooks/github → /api/process-event → Gemini AI → GitHub Comment + Slack
```

The webhook handler saves events to PostgreSQL (via Supabase), then calls the process-event API synchronously (required on Vercel serverless to prevent the function from freezing before processing completes).

## How It Works

When a new GitHub issue is opened, the bot:
1. Receives the webhook from GitHub at `/api/webhooks/github`
2. Validates the HMAC-SHA256 signature (`GITHUB_WEBHOOK_SECRET`)
3. Persists the event to the database with status `PENDING` (idempotency via `deliveryId`)
4. Calls `/api/process-event` and **awaits** it (critical for Vercel serverless)
5. Gemini generates a 2-3 sentence summary of the issue
6. Bot posts the summary as a GitHub comment using the GitHub App installation token
7. Sends a Slack notification (if `SLACK_WEBHOOK_URL` is configured)
8. Marks the event `PROCESSED` and logs the action

## Model Used

- **Model**: `gemini-2.5-flash` (overridable via `GEMINI_MODEL_NAME` env var)
- **Library**: `@google/genai` (Google Gen AI SDK)
- **Why**: Fast, low-latency, generous free tier — ideal for real-time summarization

## Prompt Design

```
Summarize the following GitHub issue in 2-3 concise sentences. 
Focus on the core problem or request.

Title: {issue_title}
Body: {issue_body}
```

**Design decisions:**
- **2-3 sentence limit**: Keeps summaries scannable in Slack notifications
- **Zero-shot**: Task is simple enough; avoids extra token cost
- **Graceful fallback**: If Gemini fails, falls back to `"AI summarization failed due to an error."` — the GitHub comment and Slack notification still fire

## Multi-Tenant Architecture

- Users sign in via **GitHub OAuth** (NextAuth)
- Each user has their own scoped data — all dashboard queries filter by `userId`
- Multiple GitHub accounts can install the bot; each gets isolated repositories and event logs
- The GitHub App must be **installed** on a user's account/org before webhooks are received

## Key Infrastructure Decisions

| Decision | Reason |
|---|---|
| Supabase port `6543` + `?pgbouncer=true` | Vercel only supports IPv4; PgBouncer pooler bridges the gap. Without `?pgbouncer=true`, Prisma throws `prepared statement already exists` errors |
| `await processEventBackground()` in webhook | Vercel freezes the serverless container the instant a response is sent. Using fire-and-forget kills the AI pipeline |
| `X-GitHub-Delivery` idempotency check | Prevents duplicate processing if GitHub retries a failed webhook delivery |

## Deployment

- **Platform**: Vercel (serverless)
- **Database**: Supabase (PostgreSQL, connection pooler port 6543)
- **Auth**: NextAuth with GitHub App OAuth
- **GitHub App**: Must be set to **Public** so any GitHub account can install it

## Completed Features

- [x] GitHub webhook ingestion with HMAC signature verification
- [x] Idempotent event processing via `X-GitHub-Delivery`
- [x] Gemini AI issue summarization
- [x] Automatic GitHub comment posting
- [x] Slack notification (optional, configured via env var)
- [x] NextAuth GitHub OAuth login
- [x] Per-user data isolation on dashboard
- [x] Installation webhook auto-registers repos to user
- [x] Dashboard: live activity log, stats, integration status
- [x] Landing page: setup guide, flow diagram, GitHub App install link
- [x] Dashboard install banner when no repos connected

## Future Improvements

- Configurable prompts per repository via UI
- PR diff summarization
- AI-powered automatic label classification
- Sentiment analysis to prioritize urgent issues
- Multi-language support (detect and reply in issue's language)
- In-app configuration UI (currently requires cloning repo + setting env vars)
