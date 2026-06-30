import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { FaGithub, FaSlack, FaRobot } from "react-icons/fa";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-slate-950 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="z-10 text-center max-w-3xl flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl ring-1 ring-indigo-500/20 mb-4">
          <FaRobot className="w-12 h-12 text-indigo-400" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 pb-2">
          Automate GitHub <br/> Like Magic.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Connect your repository, set your rules, and let our AI-powered bot handle the triage. Instantly summarize issues and pipe them to Slack.
        </p>

        <div className="pt-8">
          <LoginButton />
        </div>

        <div className="flex items-center justify-center gap-8 pt-20 opacity-50 flex-wrap">
           <div className="flex items-center gap-2 text-sm font-medium"><FaGithub className="w-5 h-5"/> GitHub Integrated</div>
           <div className="flex items-center gap-2 text-sm font-medium"><FaSlack className="w-5 h-5"/> Slack Ready</div>
           <div className="flex items-center gap-2 text-sm font-medium"><FaRobot className="w-5 h-5"/> AI Powered</div>
        </div>
      </div>
    </main>
  );
}
