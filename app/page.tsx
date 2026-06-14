"use client";
import { useFantasyStore } from "@/lib/store";
import { Trophy, Globe, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import FixtureTicker from "@/components/ui/FixtureTicker";
import { usePointsSync } from "@/lib/use-points";

const TRANSFER_WINDOWS = [
  { date: "Jun 17", label: "MD2 Window", transfers: "2 free" },
  { date: "Jul 1",  label: "R32 REBUILD 🔥", transfers: "Unlimited + $5M" },
  { date: "Jul 8",  label: "R16 Window", transfers: "4 free" },
  { date: "Jul 14", label: "QF Window", transfers: "4 free" },
  { date: "Jul 18", label: "SF Window", transfers: "5 free" },
  { date: "Jul 21", label: "FINAL 🏆", transfers: "6 free" },
];

const QUICK_LINKS = [
  { href: "/squad",       icon: "🏟️", label: "Squad",        desc: "Pitch view" },
  { href: "/captain",     icon: "🎖️", label: "Captain",      desc: "Pick wisely" },
  { href: "/transfers",   icon: "🔄", label: "Transfers",    desc: "Plan moves" },
  { href: "/analytics",   icon: "📊", label: "Analytics",    desc: "Deep stats" },
  { href: "/live",        icon: "⚡", label: "Live Mode",    desc: "Match day" },
  { href: "/ai",          icon: "🧠", label: "AI Tools",     desc: "Smart picks" },
  { href: "/formation",   icon: "⚙️", label: "Formation",    desc: "Optimizer" },
  { href: "/autobuilder", icon: "🪄", label: "Auto Build",   desc: "AI squad" },
  { href: "/players",     icon: "💎", label: "Players",      desc: "Deep dive" },
  { href: "/multiteam",   icon: "📋", label: "Multi Team",   desc: "A/B squads" },
  { href: "/community",   icon: "🌍", label: "Community",    desc: "Leagues" },
  { href: "/leagues",     icon: "🏆", label: "Leagues",      desc: "Join & create" },
  { href: "/tools",       icon: "🔧", label: "Power Tools",  desc: "Full DB" },
  { href: "/education",   icon: "🎓", label: "Learn",        desc: "Fantasy school" },
  { href: "/predictions", icon: "🎯", label: "Predict",      desc: "Score games" },
  { href: "/badges",      icon: "🏅", label: "Badges",       desc: "Achievements" },
  { href: "/content",     icon: "📸", label: "Content",      desc: "Share & create" },
  { href: "/notifications",icon: "🔔", label: "Alerts",      desc: "Notifications" },
];

export default function Dashboard() {
  const { squad, totalPoints, roundPoints, budget, freeTransfersRemaining, boosters } = useFantasyStore();
  const { loading: pointsLoading, configured: pointsConfigured, finishedCount } = usePointsSync();
  const captain = squad.find((p) => p.isCaptain);
  const vc = squad.find((p) => p.isViceCaptain);
  const nations = new Set(squad.map((p) => p.nation)).size;
  const unusedBoosters = boosters.filter((b) => !b.used).length;
  const rounds = Object.entries(roundPoints).sort();

  return (
    <div className="px-4 py-4 space-y-5 max-w-lg mx-auto">
      {/* Fixture Ticker */}
      <FixtureTicker />

      {/* New user onboarding — no squad yet */}
      {squad.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl p-5">
          <p className="text-3xl mb-2">👋</p>
          <p className="text-white font-black text-xl">Set Up Your Team!</p>
          <p className="text-white/80 text-sm mt-1 mb-4">
            You don't have a squad yet. Pick 15 players within $100M —
            build it yourself or let the Auto-Builder do it in one tap.
          </p>
          <div className="flex gap-2">
            <Link href="/transfers" className="flex-1 bg-white text-emerald-700 font-black py-3 rounded-xl text-center text-sm">
              ⚽ Pick My Players
            </Link>
            <Link href="/autobuilder" className="flex-1 bg-black/30 text-white font-black py-3 rounded-xl text-center text-sm">
              🪄 Auto-Build
            </Link>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Trophy, label: "Total Points", value: `${totalPoints}`, gradient: "from-emerald-600 to-emerald-800", iconColor: "text-emerald-200" },
          { icon: Globe, label: "Nations", value: `${nations}`, gradient: "from-blue-600 to-blue-800", iconColor: "text-blue-200" },
          { icon: Trophy, label: "Budget", value: `$${budget.toFixed(1)}M`, gradient: "from-purple-600 to-purple-800", iconColor: "text-purple-200" },
          { icon: Zap, label: "Boosters Left", value: `${unusedBoosters}`, gradient: "from-orange-600 to-orange-800", iconColor: "text-orange-200" },
        ].map(({ icon: Icon, label, value, gradient, iconColor }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-4`}>
            <Icon size={20} className={`${iconColor} mb-2`} />
            <p className="text-3xl font-black text-white">{value}</p>
            <p className={`${iconColor} text-xs mt-1`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Captain & VC */}
      {squad.length > 0 && (
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Captain & Vice-Captain</p>
        <div className="flex gap-3">
          {[{ player: captain, label: "© Captain", color: "yellow" }, { player: vc, label: "VC", color: "slate" }].map(({ player, label, color }) => (
            <div key={label} className={`flex-1 bg-${color}-500/10 border border-${color}-500/30 rounded-xl p-3 text-center`}>
              <p className="text-2xl">{player?.flag}</p>
              <p className="text-white font-bold text-sm mt-1">{player?.knownName || player?.lastName}</p>
              <p className={`text-${color}-400 text-xs`}>{label}</p>
              <p className="text-slate-400 text-xs">${player?.price}M</p>
            </div>
          ))}
        </div>
        <Link href="/captain" className="block mt-3 text-center text-emerald-400 text-sm font-semibold">Change Captain →</Link>
      </div>
      )}

      {/* Gameweek Points */}
      {squad.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-xs font-semibold uppercase">Your Fantasy Points</p>
            {pointsLoading && <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />}
          </div>
          {!pointsConfigured ? (
            <p className="text-slate-500 text-sm">Live points need the football data key.</p>
          ) : finishedCount === 0 ? (
            <p className="text-slate-500 text-sm">No matches finished yet — points appear after kickoff.</p>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-emerald-400 font-black text-4xl">{totalPoints}</p>
                <p className="text-slate-400 text-sm mb-1">pts · {finishedCount} matches played</p>
              </div>
              {rounds.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {rounds.map(([r, p]) => (
                    <div key={r} className="bg-slate-800 rounded-xl p-2 text-center">
                      <p className="text-slate-400 text-[10px] uppercase">{r}</p>
                      <p className="text-emerald-400 font-black">{p}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-slate-600 text-[10px] mt-2">
                ℹ️ Estimated from official goals + results. Exact minutes/cards aren't in the free data feed.
              </p>
            </>
          )}
        </div>
      )}

      {/* Booster Status */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Booster Status</p>
        <div className="space-y-2">
          {boosters.map((b) => (
            <div key={b.id} className={`flex items-center justify-between p-2 rounded-lg ${b.used ? "opacity-40" : "bg-slate-800"}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{b.name}</p>
                  <p className="text-slate-400 text-xs">Best: {b.recommended}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.used ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {b.used ? "Used" : "Ready"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All Features Grid */}
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">All Features</p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map(({ href, icon, label, desc }) => (
            <Link key={href} href={href} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 text-center transition-all active:scale-95">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-slate-500 text-[10px]">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Transfer Timeline */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-emerald-400" />
          <p className="text-slate-400 text-xs font-semibold uppercase">Transfer Roadmap</p>
        </div>
        <div className="space-y-2">
          {TRANSFER_WINDOWS.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <p className="text-slate-400 text-xs w-12 text-right">{w.date}</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{w.label}</p>
                <p className="text-slate-400 text-xs">{w.transfers}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
