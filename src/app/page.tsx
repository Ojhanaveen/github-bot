import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { FaGithub, FaSlack, FaRobot, FaArrowRight, FaTerminal, FaKey, FaPlug, FaCheckCircle } from "react-icons/fa";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const setupSteps = [
    {
      step: "01",
      icon: FaGithub,
      title: "Fork & Clone the Repo",
      description: "Clone this open-source project to your local machine. It's a self-hosted bot — you control your own data.",
      code: "git clone https://github.com/Ojhanaveen/github-bot",
      color: "#6366f1",
      glow: "rgba(99,102,241,0.3)",
    },
    {
      step: "02",
      icon: FaKey,
      title: "Configure Your API Keys",
      description: "Create a GitHub App, grab your Gemini AI key, and optionally set up a Slack webhook. Paste them all into your .env file.",
      code: "cp .env.example .env  # Then fill in your keys",
      color: "#8b5cf6",
      glow: "rgba(139,92,246,0.3)",
    },
    {
      step: "03",
      icon: FaTerminal,
      title: "Deploy to Vercel",
      description: "Push your code to GitHub, import the repo into Vercel, and set all environment variables in Vercel's dashboard.",
      code: "git push origin main  # Vercel auto-deploys",
      color: "#06b6d4",
      glow: "rgba(6,182,212,0.3)",
    },
    {
      step: "04",
      icon: FaPlug,
      title: "Install Your GitHub App",
      description: "Point your GitHub App's Webhook URL to your Vercel deployment. Install the app on any repo you want to monitor.",
      code: "Webhook: https://your-app.vercel.app/api/webhooks/github",
      color: "#10b981",
      glow: "rgba(16,185,129,0.3)",
    },
    {
      step: "05",
      icon: FaCheckCircle,
      title: "Sign In & Watch It Work",
      description: "Log in here with GitHub OAuth. Open any issue on your connected repo — the AI bot will instantly respond!",
      code: "# Open an issue → AI Summary appears in seconds",
      color: "#f59e0b",
      glow: "rgba(245,158,11,0.3)",
    },
  ];

  const flowSteps = [
    { icon: FaGithub, label: "GitHub Event", sublabel: "Issue / PR / Push", color: "#6366f1" },
    { icon: FaRobot, label: "Webhook → Vercel", sublabel: "Instant delivery", color: "#8b5cf6" },
    { icon: FaRobot, label: "Gemini AI", sublabel: "Generates summary", color: "#06b6d4" },
    { icon: FaGithub, label: "GitHub Comment", sublabel: "Auto-posted", color: "#10b981" },
    { icon: FaSlack, label: "Slack Alert", sublabel: "Notifies your team", color: "#f59e0b" },
  ];

  return (
    <main className="min-h-screen text-slate-200 overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1117 60%, #0a0f1e 100%)' }}>
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Open Source · Self-Hosted · AI-Powered
        </div>

        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-3xl blur-xl" style={{ background: 'rgba(99,102,241,0.4)' }} />
          <div className="relative p-5 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))', border: '1px solid rgba(99,102,241,0.4)' }}>
            <FaRobot className="w-12 h-12 text-indigo-300" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight pb-4 max-w-4xl" style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #ffffff 40%, #c7d2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.1' }}>
          Automate GitHub<br />Like Magic.
        </h1>

        <p className="text-lg md:text-xl max-w-2xl leading-relaxed mt-4" style={{ color: '#94a3b8' }}>
          An AI-powered GitHub bot that watches your repositories, summarizes issues with Gemini, and notifies your team on Slack — all in real-time.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <LoginButton />
          <a
            href="https://github.com/Ojhanaveen/github-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
          >
            <FaGithub className="w-4 h-4" />
            View Source Code
          </a>
        </div>

        {/* Tech badges */}
        <div className="mt-16 flex items-center justify-center gap-6 flex-wrap">
          {[
            { icon: FaGithub, label: "GitHub App" },
            { icon: FaRobot, label: "Gemini AI" },
            { icon: FaSlack, label: "Slack" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
              <Icon className="w-4 h-4" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS — FLOW DIAGRAM ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>How It Works</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 text-white">The event flow, visualized</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">When any GitHub event fires, the bot automatically kicks off this entire pipeline in under 5 seconds.</p>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-0">
          {flowSteps.map((step, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-2 group">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`, border: `1px solid ${step.color}40`, boxShadow: `0 0 20px ${step.color}20` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{step.sublabel}</div>
                </div>
              </div>

              {/* Arrow */}
              {idx < flowSteps.length - 1 && (
                <div className="flex items-center md:mb-6 my-2 md:mx-3">
                  <FaArrowRight className="w-3 h-3 md:rotate-0 rotate-90" style={{ color: '#334155' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SETUP STEPS ── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>Self-Hosted Setup</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 text-white">Get started in 5 steps</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
            This is an <strong className="text-slate-400">open-source, self-hosted</strong> bot. You clone the code, add your own API keys, and deploy it to your own Vercel account. Your data stays yours!
          </p>
        </div>

        {/* Important note */}
        <div className="mb-10 p-4 rounded-xl flex gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-300">Self-hosted architecture</p>
            <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
              This app is not a plug-and-play SaaS service. You need to clone the repo and configure your own API keys (GitHub App, Gemini AI, Slack). The setup takes about 15–20 minutes and requires basic technical knowledge. Follow the steps below carefully!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {setupSteps.map((s, idx) => (
            <div
              key={idx}
              className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]"
              style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex gap-5 items-start">
                {/* Step number */}
                <div
                  className="text-2xl font-black flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
                >
                  <s.icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold" style={{ color: s.color }}>STEP {s.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{s.description}</p>
                  <code className="mt-3 block text-xs px-3 py-2.5 rounded-lg font-mono" style={{ background: 'rgba(0,0,0,0.4)', color: s.color, border: `1px solid ${s.color}20` }}>
                    {s.code}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-6">Done with the setup? Sign in to access your dashboard!</p>
          <LoginButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-xs text-slate-600" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        Built with Next.js, Prisma, NextAuth & Gemini AI · Open Source on GitHub
      </footer>
    </main>
  );
}
