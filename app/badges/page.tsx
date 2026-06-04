"use client";
import { useFantasyStore } from "@/lib/store";

const ALL_BADGES = [
  { id: "globe", icon: "🌍", name: "Globe Trotter", desc: "15 players from 15 different nations", category: "Squad" },
  { id: "budget", icon: "💰", name: "Budget Genius", desc: "Use exactly $100.0M — not a penny wasted", category: "Squad" },
  { id: "eagle", icon: "🦅", name: "Eagle Eye", desc: "Spotted a differential who scored 10+ pts", category: "Picks" },
  { id: "fire", icon: "🔥", name: "On Fire", desc: "Score 100+ points in a single round", category: "Points" },
  { id: "wizard", icon: "🎩", name: "Wizard", desc: "3 consecutive correct captain picks", category: "Captain" },
  { id: "setpiece", icon: "🎯", name: "Set Piece Specialist", desc: "Captain scores from direct free-kick", category: "Captain" },
  { id: "kingkane", icon: "👑", name: "King Kane", desc: "Kane scores a hat-trick as your captain", category: "Captain" },
  { id: "cleansheet", icon: "🧤", name: "Clean Sheet King", desc: "5 clean sheets in one round", category: "Defence" },
  { id: "wallofsteel", icon: "🛡️", name: "Wall of Steel", desc: "Your defence scores 30+ pts in one round", category: "Defence" },
  { id: "streakmaster", icon: "⚡", name: "Streak Master", desc: "3 consecutive rounds in top 10% globally", category: "Rank" },
  { id: "grovestreet", icon: "🏘️", name: "Grove Street", desc: "Complete all 5 lessons in Fantasy School", category: "Learning" },
  { id: "predictor", icon: "🔮", name: "The Oracle", desc: "Predict 5 correct scores in a row", category: "Predictions" },
  { id: "wildcardwiz", icon: "🃏", name: "Wildcard Wizard", desc: "Gain 20+ pts from Wildcard rebuild", category: "Transfers" },
  { id: "differential", icon: "💎", name: "Diamond in the Rough", desc: "Low-owned player scores scouting bonus", category: "Picks" },
  { id: "allrounder", icon: "🌟", name: "All Rounder", desc: "All 11 starters score 3+ pts in one round", category: "Points" },
];

const CATEGORIES = ["All", ...new Set(ALL_BADGES.map(b => b.category))];

export default function BadgesPage() {
  const { badges } = useFantasyStore();
  const earned = new Set(badges.map(b => b.id));

  // Auto-earned badges for our squad
  const autoEarned = new Set(["globe", "budget"]);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-4">
        <span className="text-3xl">🏅</span>
        <p className="text-white font-bold text-lg mt-2">Achievement Badges</p>
        <p className="text-white/80 text-sm">{autoEarned.size} earned · {ALL_BADGES.length - autoEarned.size} to unlock</p>
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div className="bg-white rounded-full h-2" style={{ width: `${(autoEarned.size / ALL_BADGES.length) * 100}%` }} />
        </div>
      </div>

      {/* Earned Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
        <p className="text-emerald-400 font-semibold text-sm mb-2">✅ Badges Earned</p>
        <div className="flex gap-3">
          {ALL_BADGES.filter(b => autoEarned.has(b.id)).map(b => (
            <div key={b.id} className="text-center">
              <p className="text-3xl">{b.icon}</p>
              <p className="text-white text-xs font-bold mt-1">{b.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Badges Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ALL_BADGES.map(b => {
          const isEarned = autoEarned.has(b.id) || earned.has(b.id);
          return (
            <div key={b.id} className={`p-4 rounded-2xl border text-center transition-all ${isEarned ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900 border-slate-800 opacity-50 grayscale"}`}>
              <p className="text-4xl mb-2">{b.icon}</p>
              <p className="text-white font-bold text-sm">{b.name}</p>
              <p className="text-slate-400 text-xs mt-1">{b.desc}</p>
              <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${isEarned ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                {isEarned ? "✓ Earned" : b.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
