"use client";
import { useFantasyStore } from "@/lib/store";
import { useState } from "react";
import { Zap, Lock, CheckCircle, Clock } from "lucide-react";

const MOCK_MATCHES = [
  { id: 1, home: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", away: "🇭🇷 Croatia", status: "live", score: "1-0", minute: "67" },
  { id: 2, home: "🇦🇷 Argentina", away: "🇩🇿 Algeria", status: "upcoming", kickoff: "21:00" },
  { id: 3, home: "🇫🇷 France", away: "🇸🇳 Senegal", status: "upcoming", kickoff: "18:00" },
];

export default function LivePage() {
  const { squad, setCaptain } = useFantasyStore();
  const [livePoints, setLivePoints] = useState(0);
  const captain = squad.find(p => p.isCaptain);
  const vc = squad.find(p => p.isViceCaptain);

  const playerStatus = (nation: string) => {
    const match = MOCK_MATCHES.find(m => m.home.includes(nation) || m.away.includes(nation));
    if (!match) return null;
    return match.status;
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Live Mode Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
        <div>
          <p className="text-white font-bold">Match Day Mode LIVE</p>
          <p className="text-white/80 text-sm">Real-time tracking for your squad</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-white text-2xl font-black">{livePoints}</p>
          <p className="text-white/70 text-xs">Live pts</p>
        </div>
      </div>

      {/* Live Matches */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Today's Matches</p>
        <div className="space-y-2">
          {MOCK_MATCHES.map(m => (
            <div key={m.id} className={`p-3 rounded-xl border ${m.status === "live" ? "border-red-500/50 bg-red-500/5" : "border-slate-700 bg-slate-800"}`}>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{m.home}</span>
                <div className="text-center">
                  {m.status === "live"
                    ? <span className="text-white font-black">{m.score} <span className="text-red-400 text-xs">'{m.minute}</span></span>
                    : <span className="text-slate-400 text-sm">{m.kickoff}</span>}
                </div>
                <span className="text-white text-sm">{m.away}</span>
              </div>
              {m.status === "live" && (
                <div className="flex justify-center mt-1">
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Your Players Status */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Your Squad Status</p>
        <div className="space-y-2">
          {squad.filter(p => p.isStarting).map(p => {
            const status = playerStatus(p.nation);
            return (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-xl">
                <span className="text-xl">{p.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-white text-sm">{p.knownName || p.lastName}</p>
                    {p.isCaptain && <span className="text-yellow-400 text-[10px] font-bold">©C</span>}
                  </div>
                  <p className="text-slate-400 text-xs">{p.position} · {p.nation}</p>
                </div>
                <div className="flex items-center gap-1">
                  {status === "live" ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-red-400 text-xs">LIVE</span>
                    </div>
                  ) : status === "upcoming" ? (
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Soon</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">TBD</span>
                  )}
                  <span className="text-emerald-400 font-bold ml-2">0</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Substitution Rules */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Live Sub Rules</p>
        {[
          { icon: CheckCircle, text: "Can sub a completed match player for bench player yet to play", color: "text-emerald-400" },
          { icon: Lock, text: "Cannot swap a player whose match is currently LIVE", color: "text-red-400" },
          { icon: Zap, text: "Making any manual change CANCELS auto-subs for this round", color: "text-yellow-400" },
        ].map(({ icon: Icon, text, color }, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
            <p className="text-slate-300 text-xs">{text}</p>
          </div>
        ))}
      </div>

      {/* Auto Sub Priority */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Auto Sub Priority (if no manual changes)</p>
        <div className="space-y-2">
          {squad.filter(p => !p.isStarting).map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-xl">
              <span className="text-slate-400 font-bold w-5">#{i+1}</span>
              <span>{p.flag}</span>
              <span className="text-white text-sm">{p.knownName || p.lastName}</span>
              <span className="text-slate-400 text-xs ml-auto">{p.position}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
