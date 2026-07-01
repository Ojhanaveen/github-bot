import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaCheckCircle, FaTimesCircle, FaClock, FaGithub, FaRobot, FaSlack, FaBolt, FaExternalLinkAlt, FaCode, FaDownload, FaArrowRight } from "react-icons/fa";
import { LogoutButton } from "@/components/LogoutButton";
import { LocalTime } from "@/components/LocalTime";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const userId = (session.user as any).id;

  const [eventLogs, totalProcessed, totalFailed, repos, totalEvents, totalActions] = await Promise.all([
    prisma.eventLog.findMany({
      where: { repository: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { actions: true, repository: true }
    }),
    prisma.eventLog.count({ where: { status: 'PROCESSED', repository: { userId } } }),
    prisma.eventLog.count({ where: { status: 'FAILED', repository: { userId } } }),
    prisma.repository.findMany({ where: { userId } }),
    prisma.eventLog.count({ where: { repository: { userId } } }),
    prisma.actionLog.count({ where: { event: { repository: { userId } } } }),
  ]);

  const slackConfigured = !!process.env.SLACK_WEBHOOK_URL;
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const GITHUB_APP_INSTALL_URL = 'https://github.com/apps/git-automation-bot-naveen';

  return (
    <div className="min-h-screen text-slate-200" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1117 50%, #0a0f1e 100%)' }}>
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Header */}
      <header style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.15)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-sm" style={{ background: 'rgba(99,102,241,0.4)' }} />
              <div className="relative p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                <FaRobot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ background: 'linear-gradient(90deg, #a5b4fc, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                GitHub Bot Dashboard
              </h1>
              <p className="text-xs text-slate-500">Logged in as <span className="text-indigo-400 font-medium">{session.user?.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: totalEvents, icon: FaBolt, gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.3)', textColor: '#a5b4fc', desc: 'Webhooks received' },
            { label: "Processed", value: totalProcessed, icon: FaCheckCircle, gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: 'rgba(16,185,129,0.25)', glow: 'rgba(16,185,129,0.3)', textColor: '#6ee7b7', desc: 'Successfully handled' },
            { label: "Failed", value: totalFailed, icon: FaTimesCircle, gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', border: 'rgba(239,68,68,0.25)', glow: 'rgba(239,68,68,0.3)', textColor: '#fca5a5', desc: 'Needs attention' },
            { label: "Actions Taken", value: totalActions, icon: FaRobot, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: 'rgba(139,92,246,0.25)', glow: 'rgba(139,92,246,0.3)', textColor: '#c4b5fd', desc: 'AI responses sent' },
          ].map((stat) => (
            <div key={stat.label} className="relative group rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: stat.gradient, border: `1px solid ${stat.border}` }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 30px ${stat.glow}` }} />
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <stat.icon className="w-4 h-4" style={{ color: stat.textColor }} />
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{stat.desc}</span>
                </div>
                <div className="text-4xl font-black" style={{ color: stat.textColor }}>{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── GitHub App Install Banner (shown when no repos connected) ── */}
        {repos.length === 0 && (
          <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(99,102,241,0.35)' }}>
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(30px)' }} />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}>
                  <FaDownload className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Action Required</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>Not Installed</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Install the GitHub App on your account</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
                    To start receiving events, you must install the <strong className="text-indigo-300">Git Automation Bot</strong> GitHub App on your account or organization. This grants it permission to send webhooks to this dashboard whenever issues or pull requests are opened.
                  </p>
                  <p className="text-xs text-slate-500 mt-2">After installing, come back here — your repositories will appear automatically within seconds.</p>
                </div>
              </div>
              <a
                href={GITHUB_APP_INSTALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex-shrink-0 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              >
                <FaGithub className="w-4 h-4" />
                Install GitHub App
                <FaArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Activity Log — 2/3 width */}
          <div className="md:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="font-bold text-white flex items-center gap-2">
                <FaBolt className="text-indigo-400 w-4 h-4" />
                Live Activity Log
              </h2>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                {eventLogs.length} recent events
              </span>
            </div>

            <div className="divide-y divide-slate-800/40 max-h-[600px] overflow-y-auto">
              {eventLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <FaBolt className="w-8 h-8 text-indigo-400 opacity-50" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-300 font-medium">Waiting for events...</p>
                    <p className="text-slate-500 text-sm mt-1">Open an issue on a connected repo to see it here in real-time.</p>
                  </div>
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {log.status === 'PROCESSED' ? (
                          <div className="p-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <FaCheckCircle className="text-emerald-400 w-3.5 h-3.5" />
                          </div>
                        ) : log.status === 'FAILED' ? (
                          <div className="p-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <FaTimesCircle className="text-red-400 w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full" style={{ background: 'rgba(245,158,11,0.15)' }}>
                            <FaClock className="text-amber-400 w-3.5 h-3.5 animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <FaGithub className="w-3.5 h-3.5 text-slate-500" />
                            <code className="text-xs px-2 py-0.5 rounded-md font-mono font-semibold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                              {log.eventType}
                            </code>
                            {log.repository && (
                              <span className="text-xs text-slate-500 hidden sm:inline">{log.repository.fullName}</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-600 flex-shrink-0">
                            <LocalTime date={log.createdAt} />
                          </span>
                        </div>

                        {log.actions.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {log.actions.map(action => {
                              const isSlackSkipped = action.details.includes('Slack skipped');
                              const isAiAdded = action.details.includes('AI comment');
                              const isSlackSent = action.details.includes('Sent Slack');

                              return (
                                <div key={action.id} className="text-xs rounded-lg px-3 py-2 flex gap-2 items-start" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <FaRobot className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                                  <span className="flex flex-col gap-1">
                                    {isAiAdded && (
                                      <span className="text-emerald-400">✓ AI summary comment posted to GitHub issue</span>
                                    )}
                                    {isSlackSent && (
                                      <span className="text-sky-400">✓ Slack notification delivered</span>
                                    )}
                                    {isSlackSkipped && (
                                      <span className="flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
                                        ⚠ Slack notification skipped —{' '}
                                        <span className="underline underline-offset-2" style={{ color: '#fbbf24' }}>
                                          SLACK_WEBHOOK_URL is not set in your environment variables
                                        </span>
                                      </span>
                                    )}
                                    {!isAiAdded && !isSlackSent && !isSlackSkipped && (
                                      <span className="text-slate-400">{action.details}</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {log.error && (
                          <div className="mt-2 text-xs px-3 py-2 rounded-lg flex gap-2 items-start" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                            <FaTimesCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {log.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Integration Status */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="font-bold text-white text-sm">Integration Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your configured services</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  {
                    name: "GitHub App",
                    icon: FaGithub,
                    status: true,
                    tip: null,
                  },
                  {
                    name: "Gemini AI",
                    icon: FaRobot,
                    status: geminiConfigured,
                    tip: !geminiConfigured ? "Add GEMINI_API_KEY to your Vercel environment variables." : null,
                  },
                  {
                    name: "Slack Notifications",
                    icon: FaSlack,
                    status: slackConfigured,
                    tip: !slackConfigured ? "Add SLACK_WEBHOOK_URL to Vercel env vars to enable Slack alerts." : null,
                  },
                ].map(item => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                        {item.name}
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${item.status
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                        }`}
                        style={{
                          background: item.status ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          border: `1px solid ${item.status ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`
                        }}>
                        {item.status ? '● Connected' : '○ Not Set'}
                      </span>
                    </div>
                    {item.tip && (
                      <p className="text-xs text-amber-400/70 pl-5 leading-relaxed">{item.tip}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Repos */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-white text-sm flex items-center gap-2">
                    <FaGithub className="text-slate-400 w-4 h-4" /> Connected Repos
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>{repos.length}</span>
                </div>
                <a
                  href={GITHUB_APP_INSTALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                >
                  <FaDownload className="w-3 h-3" />
                  {repos.length === 0 ? 'Install App to Connect Repos' : '+ Install on More Accounts'}
                </a>
              </div>
              <div className="p-4">
                {repos.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <FaGithub className="w-6 h-6 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500">No repos connected yet.</p>
                    <p className="text-xs text-slate-600">Install the GitHub App on your account to connect repos.</p>
                  </div>
                ) : (
                  <ul className="space-y-1.5 max-h-64 overflow-y-auto">
                    {repos.map(repo => (
                      <li key={repo.id}>
                        <a
                          href={`https://github.com/${repo.fullName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs px-3 py-2 rounded-lg group transition-all duration-200 hover:scale-[1.01]"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <span className="flex items-center gap-2 text-slate-300 truncate">
                            <FaCode className="text-slate-500 w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{repo.fullName}</span>
                          </span>
                          <FaExternalLinkAlt className="w-2.5 h-2.5 text-slate-600 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Quick Help */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
              <h3 className="text-sm font-bold text-indigo-300">Quick Help</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex gap-2"><span className="text-indigo-400 font-bold">1.</span>Open or close an issue on any connected repo</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-bold">2.</span>Bot receives webhook from GitHub instantly</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-bold">3.</span>Gemini AI generates a summary &amp; posts comment</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-bold">4.</span>Slack alert fires (if configured above)</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-bold">5.</span>Event appears here in the activity log</li>
              </ul>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
          <div className="w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />
          <p className="text-sm font-medium mt-2" style={{ color: '#334155' }}>
            Crafted with{' '}
            <span className="animate-pulse inline-block" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>♥</span>
            {' '}by{' '}
            <a href="https://github.com/Ojhanaveen" target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-80 transition-opacity" style={{ background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Naveen Kumar
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
