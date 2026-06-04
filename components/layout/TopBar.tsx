"use client";
import { Bell, Trophy } from "lucide-react";
import { useFantasyStore } from "@/lib/store";

export default function TopBar() {
  const { teamName, totalPoints, notifications } = useFantasyStore();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 h-16 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚽</span>
        <div>
          <p className="text-xs text-emerald-400 font-semibold">GROVE STREET FC</p>
          <p className="text-sm font-bold text-white truncate max-w-[140px]">{teamName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-full">
          <Trophy size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-bold text-sm">{totalPoints} pts</span>
        </div>
        <button className="relative p-2 rounded-full hover:bg-slate-800 transition">
          <Bell size={18} className="text-slate-300" />
          {notifications && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />}
        </button>
      </div>
    </header>
  );
}
