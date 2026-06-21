"use client";
import { useFantasyStore } from "@/lib/store";
import { Bell, Moon, User, Smartphone, Globe, Zap, MessageCircle, ChevronRight, Code2 } from "lucide-react";
import Link from "next/link";

const MORE_SECTIONS = [
  {
    title: "Features",
    items: [
      { href: "/notifications", icon: Bell, label: "Notifications", desc: "Transfer window alerts" },
      { href: "/leagues", icon: Globe, label: "All Leagues", desc: "Public & private leagues" },
      { href: "/tools", icon: Zap, label: "Player Database", desc: "Full 1,481 player list" },
      { href: "/challenge", icon: Zap, label: "Penalty Challenge", desc: "Shootout game + leaderboard" },
    ]
  },
  {
    title: "Experimental",
    items: [
      { href: "/ar", icon: Smartphone, label: "AR Pitch View", desc: "See your squad in AR" },
      { href: "/bot", icon: MessageCircle, label: "Telegram Bot", desc: "Daily briefings via message" },
      { href: "/draft", icon: Globe, label: "Fantasy Draft", desc: "Draft mode with friends" },
    ]
  },
  {
    title: "About",
    items: [
      { href: "/developer", icon: Code2, label: "Developer Credit", desc: "Who & what built this app" },
    ]
  },
];

export default function MorePage() {
  const { teamName, setTeamName, darkMode, toggleDarkMode, notifications, toggleNotifications } = useFantasyStore();

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-5">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-2xl">⚽</div>
          <div className="flex-1">
            <input value={teamName} onChange={e => setTeamName(e.target.value)}
              className="bg-transparent text-white font-bold text-lg focus:outline-none border-b border-transparent focus:border-emerald-400 w-full" />
            <p className="text-slate-400 text-sm">Grove Street FC Manager</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <p className="text-slate-400 text-xs font-semibold uppercase p-4 pb-2">Settings</p>
        <div className="divide-y divide-slate-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-slate-400" />
              <div>
                <p className="text-white text-sm">Push Notifications</p>
                <p className="text-slate-400 text-xs">Transfer windows & scores</p>
              </div>
            </div>
            <button onClick={toggleNotifications} className={`w-12 h-6 rounded-full transition-all ${notifications ? "bg-emerald-500" : "bg-slate-700"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mx-0.5 ${notifications ? "translate-x-6" : ""}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-slate-400" />
              <div>
                <p className="text-white text-sm">Dark Mode</p>
                <p className="text-slate-400 text-xs">Always on for best experience</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full transition-all ${darkMode ? "bg-emerald-500" : "bg-slate-700"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mx-0.5 ${darkMode ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* More Features */}
      {MORE_SECTIONS.map(section => (
        <div key={section.title} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <p className="text-slate-400 text-xs font-semibold uppercase p-4 pb-2">{section.title}</p>
          <div className="divide-y divide-slate-800">
            {section.items.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="flex items-center justify-between p-4 hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-slate-400" />
                  <div>
                    <p className="text-white text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* App Info */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center">
        <p className="text-3xl mb-2">⚽</p>
        <p className="text-white font-bold">WC2026 Fantasy Hub</p>
        <p className="text-slate-400 text-xs">v1.0.0 · Grove Street FC Edition</p>
        <p className="text-slate-500 text-xs mt-1">48 nations · 1,481 players · more coming</p>
        <p className="text-emerald-400 text-xs font-semibold mt-2">Grove Street for life 🟢</p>
      </div>
    </div>
  );
}
