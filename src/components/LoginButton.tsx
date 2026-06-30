'use client';
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";

export function LoginButton() {
  return (
    <button
      onClick={() => signIn('github')}
      className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)]"
    >
      <FaGithub className="w-6 h-6 transition-transform group-hover:scale-110" />
      <span>Sign in with GitHub</span>
    </button>
  );
}
