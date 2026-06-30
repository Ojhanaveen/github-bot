# Event-Driven GitHub Automation Bot

An AI-powered bot that listens to GitHub repository events (issues, pull requests) and automatically performs actions like posting AI-generated summaries and sending Slack notifications. Built with Next.js, Prisma, Supabase, and Google Gemini.

## 🌐 Deployed URL

**Live app:** https://github-bot-fawn.vercel.app

Deployed on **Vercel** (serverless, free tier). Database hosted on **Supabase** (PostgreSQL, free tier).

## ✨ Features

- **GitHub OAuth Login** — Secure sign-in via GitHub App authentication
- **Webhook Ingestion** — Receives and cryptographically verifies GitHub webhooks (HMAC-SHA256)
- **Idempotency** — Uses `X-GitHub-Delivery` headers to prevent duplicate processing
- **AI Summaries** — Uses Google Gemini (`gemini-2.5-flash`) to summarize issues in 2-3 sentences
- **GitHub Actions** — Automatically posts AI-generated comments back to issues
- **Slack Notifications** — Sends real-time alerts to your Slack channel (optional)
- **Live Dashboard** — View all events, actions taken, and integration status (behind login)
- **Multi-tenant** — Multiple GitHub accounts can install the bot; data is fully isolated per user

## 🛠 Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Authentication**: NextAuth.js with GitHub provider
- **GitHub Integration**: Octokit (GitHub App authentication with JWT + installation tokens)
- **AI**: Google Gemini API (`@google/genai`)
- **Deployment**: Vercel (serverless)
- **Local Webhook Tunneling**: Smee.io

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- A GitHub App ([create one here](https://github.com/settings/apps))
- A Supabase project ([create one here](https://supabase.com))
- A Google AI Studio API key ([get one here](https://aistudio.google.com/apikey))
- Optionally: A Slack Incoming Webhook ([create one here](https://api.slack.com/apps))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ojhanaveen/github-bot.git
   cd github-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in all values in .env
   ```

4. **Push the database schema**
   ```bash
   npx prisma db push
   ```

5. **Start the Smee webhook proxy** (in a separate terminal)
   ```bash
   npx smee-client --url YOUR_SMEE_URL --target http://localhost:3000/api/webhooks/github
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

## ⚙️ Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string from Supabase (use port **6543** with `?pgbouncer=true` for Vercel) |
| `NEXTAUTH_URL` | Your deployment URL (e.g. `https://your-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (`openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | GitHub App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub App Client Secret |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_PRIVATE_KEY` | GitHub App private key (RSA, as single-line with `\n`) |
| `GITHUB_WEBHOOK_SECRET` | Secret used to verify webhook signatures |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL_NAME` | Gemini model to use (default: `gemini-2.5-flash`) |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL (optional) |

## 🧪 How to Test It

### Using the live deployed app

1. Go to **https://github-bot-fawn.vercel.app**
2. Click **"Sign in with GitHub"**
3. After login, you will see a banner to **Install the GitHub App** — click it and install on your account/repo
4. Go back to the dashboard. Your repositories will appear automatically.
5. Open a new issue on any connected repository.
6. Within 5 seconds, the bot will:
   - Post an AI-generated summary comment on the issue
   - Send a Slack notification (if Slack is configured)
   - Log the event in the dashboard activity log

> **Note:** This is a self-hosted architecture. The GitHub App (`git-automation-bot-naveen`) is owned by the author. To test with your own keys, clone the repo, configure your own `.env`, and deploy to your own Vercel account.

### Demo repo for webhook testing

Point the webhook at a fresh test repo — the bot accepts any GitHub repository that has the app installed. The existing test repo `Ojhanaveen/test` already has the app installed and can receive events.

## 🔒 Security

- All webhook payloads are verified using HMAC-SHA256 signatures
- Secrets are stored server-side only (never exposed to the client)
- The dashboard is protected behind GitHub OAuth
- All database queries are scoped to the authenticated user's ID

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth GitHub OAuth
│   │   ├── webhooks/github/     # Webhook receiver & verifier
│   │   └── process-event/       # Event processor (AI + GitHub + Slack)
│   ├── dashboard/               # Protected dashboard UI
│   └── page.tsx                 # Landing page with setup guide
├── components/                  # Reusable UI components
├── lib/
│   ├── ai.ts                    # Gemini AI client
│   ├── github.ts                # GitHub App (Octokit)
│   └── prisma.ts                # Prisma client singleton
└── types/                       # TypeScript type extensions
prisma/
└── schema.prisma                # Database schema
```

## 🤖 AI Context Files

- `AGENTS.md` — instructions used with AI coding assistants
- `AI_NOTES.md` — full notes on AI usage, decisions, and the hardest bug
