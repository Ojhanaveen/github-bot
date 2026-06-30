import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaCheckCircle, FaTimesCircle, FaClock, FaGithub, FaRobot, FaSlack, FaBolt } from "react-icons/fa";
import { LogoutButton } from "@/components/LogoutButton";

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
      include: { actions: true } 
    }),
    prisma.eventLog.count({ where: { status: 'PROCESSED', repository: { userId } } }),
    prisma.eventLog.count({ where: { status: 'FAILED', repository: { userId } } }),
    prisma.repository.findMany({ where: { userId } }),
    prisma.eventLog.count({ where: { repository: { userId } } }),
    prisma.actionLog.count({ where: { event: { repository: { userId } } } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg ring-1 ring-indigo-500/20">
              <FaRobot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">GitHub Bot</h1>
              <p className="text-xs text-slate-400">Welcome, {session.user?.name}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: totalEvents, icon: FaBolt, color: "text-indigo-400", bg: "bg-indigo-500/10 ring-indigo-500/20" },
            { label: "Processed", value: totalProcessed, icon: FaCheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 ring-emerald-500/20" },
            { label: "Failed", value: totalFailed, icon: FaTimesCircle, color: "text-red-400", bg: "bg-red-500/10 ring-red-500/20" },
            { label: "Actions Taken", value: totalActions, icon: FaRobot, color: "text-violet-400", bg: "bg-violet-500/10 ring-violet-500/20" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className={`inline-flex p-2 rounded-lg ring-1 ${stat.bg} mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Activity Log - left 2/3 */}
          <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FaBolt className="text-indigo-400 w-4 h-4" /> Live Activity Log
              </h2>
              <span className="text-xs text-slate-500">{eventLogs.length} recent events</span>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-[580px] overflow-y-auto">
              {eventLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                  <FaBolt className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No events yet. Open an issue on a connected repo!</p>
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {log.status === 'PROCESSED' ? (
                          <FaCheckCircle className="text-emerald-500 w-4 h-4" />
                        ) : log.status === 'FAILED' ? (
                          <FaTimesCircle className="text-red-500 w-4 h-4" />
                        ) : (
                          <FaClock className="text-amber-500 w-4 h-4 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-200">
                            <FaGithub className="w-3.5 h-3.5 text-slate-400" />
                            <code className="text-indigo-400 text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded">{log.eventType}</code>
                          </span>
                          <span className="text-xs text-slate-500 flex-shrink-0">
                            {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {log.actions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {log.actions.map(action => (
                              <div key={action.id} className="text-xs text-slate-400 bg-slate-800/60 px-3 py-2 rounded-md flex gap-2 items-start">
                                <FaRobot className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                                <span>{action.details}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {log.error && (
                          <div className="mt-2 text-xs text-red-400 bg-red-950/30 px-3 py-2 rounded-md border border-red-900/50">
                            ⚠ {log.error}
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
            {/* Connected Repos */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <FaGithub className="text-slate-400 w-4 h-4" /> Connected Repositories
                </h2>
              </div>
              <div className="p-5">
                {repos.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">No repositories connected yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {repos.map(repo => (
                      <li key={repo.id} className="text-sm text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg flex items-center gap-2">
                        <FaGithub className="text-slate-400 w-3.5 h-3.5" />
                        {repo.fullName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="font-semibold text-white text-sm">Integration Status</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { name: "GitHub App", icon: FaGithub, status: true },
                  { name: "Slack Webhook", icon: FaSlack, status: !!process.env.SLACK_WEBHOOK_URL },
                  { name: "Gemini AI", icon: FaRobot, status: !!process.env.GEMINI_API_KEY },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <item.icon className="w-3.5 h-3.5 text-slate-400" />
                      {item.name}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'}`}>
                      {item.status ? 'Connected' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
