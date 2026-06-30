'use client';
import { signOut } from "next-auth/react";
import { FaSignOutAlt } from "react-icons/fa";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
    >
      <FaSignOutAlt className="w-4 h-4" />
      Sign Out
    </button>
  );
}
