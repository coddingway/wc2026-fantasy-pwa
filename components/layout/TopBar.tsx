"use client";
import { Trophy, UserCircle2, CloudOff } from "lucide-react";
import Link from "next/link";
import { useFantasyStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { getTeam } from "@/lib/themes";

export default function TopBar() {
  const { teamName, totalPoints, favoriteTeam } = useFantasyStore();
  const { user, enabled } = useAuth();
  const team = getTeam(favoriteTeam);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 h-16 flex items-center px-4 justify-between">
      {/* Flag-colors strip — shows the selected nation's full flag palette */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--flag-gradient)" }} />
      <Link href="/team-select" className="flex items-center gap-2">
        <span className="text-2xl">{team ? team.flag : "⚽"}</span>
        <div>
          <p className="text-xs text-emerald-400 font-semibold uppercase">{team ? team.name : "Grove Street FC"}</p>
          <p className="text-sm font-bold text-white truncate max-w-[140px]">{teamName}</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-full">
          <Trophy size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-bold text-sm">{totalPoints} pts</span>
        </div>
        <Link href="/login" className="relative p-1.5 rounded-full hover:bg-slate-800 transition" aria-label={user ? "Account" : "Login"}>
          {user ? (
            <>
              <UserCircle2 size={22} className="text-emerald-400" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
            </>
          ) : enabled ? (
            <UserCircle2 size={22} className="text-slate-400" />
          ) : (
            <CloudOff size={20} className="text-slate-600" />
          )}
        </Link>
      </div>
    </header>
  );
}
