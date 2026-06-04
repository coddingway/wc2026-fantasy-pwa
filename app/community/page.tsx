"use client";
import { useState } from "react";
import { useFantasyStore } from "@/lib/store";
import { Users, Trophy, MessageCircle, Globe, Star } from "lucide-react";

const MOCK_LEAGUE: { rank: number; name: string; pts: number; last: number }[] = [
  { rank: 1, name: "Balogun's Boys", pts: 234, last: 67 },
  { rank: 2, name: "Grove Street FC", pts: 198, last: 54 },
  { rank: 3, name: "Tenpenny FC", pts: 187, last: 41 },
  { rank: 4, name: "Sweet's XI", pts: 176, last: 58 },
  { rank: 5, name: "Ryder United", pts: 165, last: 39 },
];

const MOCK_BADGES = [
  { id: "globe", icon: "🌍", name: "Globe Trotter", desc: "15 players from 15 nations", earned: true },
  { id: "budget", icon: "💰", name: "Budget Genius", desc: "Squad exactly $100M", earned: true },
  { id: "eagle", icon: "🦅", name: "Eagle Eye", desc: "Differential 10+ pts", earned: false },
  { id: "fire", icon: "🔥", name: "On Fire", desc: "100+ pts in one round", earned: false },
  { id: "wizard", icon: "🎩", name: "Wizard", desc: "3 correct captain picks", earned: false },
  { id: "setpiece", icon: "🎯", name: "Set Piece Specialist", desc: "Captain scores from set piece", earned: false },
];

export default function CommunityPage() {
  const { teamName, badges } = useFantasyStore();
  const [tab, setTab] = useState<"league" | "badges" | "roast" | "ranks">("league");
  const [roastText, setRoastText] = useState("");

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4">
        <Globe size={24} className="text-indigo-200 mb-2" />
        <p className="text-white font-bold text-lg">Community Hub</p>
        <p className="text-white/80 text-sm">Leagues, badges, rankings & squad roasting</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
        {(["league", "badges", "roast", "ranks"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? "bg-emerald-600 text-white" : "text-slate-400"}`}>
            {t === "league" ? "🏆 League" : t === "badges" ? "🏅 Badges" : t === "roast" ? "😂 Roast" : "🌍 Global"}
          </button>
        ))}
      </div>

      {/* Mini League */}
      {tab === "league" && (
        <div className="space-y-3">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Grove Street Mini League</p>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">5 players</span>
            </div>
            {MOCK_LEAGUE.map(m => (
              <div key={m.rank} className={`flex items-center gap-3 p-2 rounded-xl mb-1 ${m.name === teamName ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800"}`}>
                <span className={`font-black w-5 text-sm ${m.rank === 1 ? "text-yellow-400" : m.rank === 2 ? "text-slate-300" : m.rank === 3 ? "text-orange-400" : "text-slate-500"}`}>#{m.rank}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{m.name}</p>
                  <p className="text-slate-400 text-xs">Last: +{m.last} pts</p>
                </div>
                <p className="text-emerald-400 font-bold">{m.pts}</p>
              </div>
            ))}
          </div>
          <button className="w-full bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 font-bold py-3 rounded-xl transition-all">
            + Create New League
          </button>
          <button className="w-full bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 font-bold py-3 rounded-xl transition-all">
            🔗 Join with Code
          </button>
        </div>
      )}

      {/* Badges */}
      {tab === "badges" && (
        <div className="grid grid-cols-2 gap-3">
          {MOCK_BADGES.map(b => (
            <div key={b.id} className={`p-4 rounded-2xl border text-center ${b.earned ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900 border-slate-800 opacity-50"}`}>
              <p className="text-4xl mb-2">{b.icon}</p>
              <p className="text-white font-bold text-sm">{b.name}</p>
              <p className="text-slate-400 text-xs mt-1">{b.desc}</p>
              {b.earned && <span className="text-emerald-400 text-xs font-bold mt-1 block">✓ Earned!</span>}
            </div>
          ))}
        </div>
      )}

      {/* Squad Roast */}
      {tab === "roast" && (
        <div className="space-y-3">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-white font-semibold mb-2">😂 Squad Roast Mode</p>
            <p className="text-slate-400 text-sm mb-3">Submit your squad for community roasting or roast others</p>
            <div className="space-y-2">
              {["Ochoa as backup GK 😭", "Perisic on bench at 36 🤣", "No Mbappé, are you serious?", "15 nations but 0 points 💀"].map(r => (
                <div key={r} className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-300 text-sm">{r}</p>
                </div>
              ))}
            </div>
            <textarea value={roastText} onChange={e => setRoastText(e.target.value)}
              placeholder="Write your roast here..." rows={2}
              className="w-full bg-slate-800 text-white text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 mt-3 resize-none" />
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl mt-2">🔥 Post Roast</button>
          </div>
        </div>
      )}

      {/* Global Rankings */}
      {tab === "ranks" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Global Leaderboard</p>
          <div className="text-center py-8">
            <Globe size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Tournament hasn't started yet</p>
            <p className="text-slate-500 text-sm">Rankings will appear after June 11</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-slate-400 text-xs mb-2">Your entry:</p>
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
              <span className="text-slate-400 font-bold">#--</span>
              <div className="flex-1">
                <p className="text-white font-medium">{teamName}</p>
                <p className="text-slate-400 text-xs">Registered ✓</p>
              </div>
              <span className="text-emerald-400 font-bold">0 pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
