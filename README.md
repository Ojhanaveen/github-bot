# Event-Driven GitHub Automation Bot

An AI-powered bot that listens to GitHub repository events (issues, pull requests) and automatically performs actions like posting AI-generated summaries, adding labels, and sending Slack notifications. Built with Next.js, Prisma, Supabase, and Google Gemini.

## ✨ Features

- **GitHub OAuth Login** — Secure sign-in via GitHub App authentication
- **Webhook Ingestion** — Receives and cryptographically verifies GitHub webhooks (issues, PRs)
- **Idempotency** — Uses `X-GitHub-Delivery` headers to prevent duplicate processing
- **AI Summaries** — Uses Google Gemini (`gemini-2.5-flash`) to summarize issues
- **GitHub Actions** — Automatically posts AI-generated comments back to issues
- **Slack Notifications** — Sends real-time alerts to your Slack channel
- **Live Dashboard** — View all events, actions taken, and integration status (behind login)
- **Reliable by Design** — Events are saved to DB first before processing; failures are logged

## 🛠 Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Authentication**: NextAuth.js with GitHub provider
- **GitHub Integration**: Octokit (GitHub App authentication with JWT + installation tokens)
- **AI**: Google Gemini API (`@google/genai`)
- **Deployment**: Vercel (free tier)
- **Local Webhook Tunneling**: Smee.io

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- A GitHub App ([create one here](https://github.com/settings/apps))
- A Supabase project ([create one here](https://supabase.com))
- A Slack workspace with an Incoming Webhook ([create one here](https://api.slack.com/apps))
- A Google AI Studio API key ([get one here](https://aistudio.google.com/apikey))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/github-bot.git
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
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (`openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | GitHub App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub App Client Secret |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_PRIVATE_KEY` | GitHub App private key (RSA, as single-line with `\n`) |
| `GITHUB_WEBHOOK_SECRET` | Secret used to verify webhook signatures |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL |


## 🔒 Security

- All webhook payloads are verified using HMAC-SHA256 signatures
- Secrets are stored server-side only (never exposed to the client)
- The dashboard is protected behind GitHub OAuth

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth GitHub OAuth
│   │   ├── webhooks/github/     # Webhook receiver & verifier
│   │   └── process-event/       # Event processor (AI + GitHub + Slack)
│   ├── dashboard/               # Protected dashboard UI
│   └── page.tsx                 # Landing page
├── components/                  # Reusable UI components
├── lib/
│   ├── ai.ts                    # Gemini AI client
│   ├── github.ts                # GitHub App (Octokit)
│   └── prisma.ts                # Prisma client singleton
└── types/                       # TypeScript type extensions
prisma/
└── schema.prisma                # Database schema
```
