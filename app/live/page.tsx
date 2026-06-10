"use client";
import { useState, useEffect, useCallback } from "react";
import { useFantasyStore } from "@/lib/store";
import { Zap, Lock, CheckCircle, Clock, RefreshCw, WifiOff } from "lucide-react";
import type { ApiMatch } from "@/app/api/fixtures/route";

const dayKey = (iso: string) => new Date(iso).toDateString();

export default function LivePage() {
  const { squad } = useFantasyStore();
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/fixtures");
      const data = await res.json();
      setConfigured(data.configured);
      setMatches(data.matches ?? []);
      setLastSync(new Date());
    } catch {
      // keep last known data
    } finally {
      setLoading(false);
    }
  }, []);

  // Load + auto-refresh every 60s while any match is live
  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const live = matches.filter((m) => m.status === "IN_PLAY" || m.status === "PAUSED");
  const today = matches.filter((m) => dayKey(m.utcDate) === new Date().toDateString());
  const upcoming = matches
    .filter((m) => (m.status === "SCHEDULED" || m.status === "TIMED") && dayKey(m.utcDate) !== new Date().toDateString())
    .slice(0, 6);
  const finished = matches.filter((m) => m.status === "FINISHED").slice(-5).reverse();

  const playerMatch = (nation: string) =>
    matches.find(
      (m) => (m.home.tla === nation || m.away.tla === nation) &&
        ["IN_PLAY", "PAUSED", "TIMED", "SCHEDULED"].includes(m.status)
    );

  const MatchRow = ({ m }: { m: ApiMatch }) => {
    const isLive = m.status === "IN_PLAY" || m.status === "PAUSED";
    const done = m.status === "FINISHED";
    return (
      <div className={`p-3 rounded-xl border ${isLive ? "border-red-500/50 bg-red-500/5" : "border-slate-700 bg-slate-800"}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-white text-sm flex-1 text-right truncate">{m.home.name}</span>
          <div className="text-center min-w-[70px]">
            {isLive || done ? (
              <span className="text-white font-black">
                {m.score.home ?? 0}-{m.score.away ?? 0}
                {isLive && <span className="text-red-400 text-xs ml-1">{m.minute != null ? `${m.minute}'` : "LIVE"}</span>}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">
                {new Date(m.utcDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <span className="text-white text-sm flex-1 truncate">{m.away.name}</span>
        </div>
        <div className="flex justify-center gap-2 mt-1">
          {m.group && <span className="text-slate-500 text-[10px]">{m.group}</span>}
          {isLive && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>}
          {done && <span className="text-slate-500 text-[10px]">FT</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Live Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-4 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full bg-white ${live.length ? "animate-pulse" : "opacity-40"}`} />
        <div className="flex-1">
          <p className="text-white font-bold">Match Day Mode {live.length ? "LIVE" : ""}</p>
          <p className="text-white/80 text-sm">
            {live.length ? `${live.length} match${live.length > 1 ? "es" : ""} in play` : "Real World Cup data · auto-refreshes every 60s"}
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-full bg-white/10">
          <RefreshCw size={16} className={`text-white ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!configured && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex gap-3">
          <WifiOff size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-semibold text-sm">Live data not connected yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Add the free FOOTBALL_DATA_API_KEY env var (see SETUP_KEYS.md) and real scores light up here.
            </p>
          </div>
        </div>
      )}

      {/* Live now */}
      {live.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-red-500/30">
          <p className="text-red-400 text-xs font-semibold uppercase mb-3">🔴 Live Now</p>
          <div className="space-y-2">{live.map((m) => <MatchRow key={m.id} m={m} />)}</div>
        </div>
      )}

      {/* Today */}
      {today.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Today's Matches</p>
          <div className="space-y-2">{today.map((m) => <MatchRow key={m.id} m={m} />)}</div>
        </div>
      )}

      {/* Your squad status */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Your Squad Status</p>
        <div className="space-y-2">
          {squad.filter((p) => p.isStarting).map((p) => {
            const m = playerMatch(p.nation);
            const isLive = m && (m.status === "IN_PLAY" || m.status === "PAUSED");
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
                {isLive ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-red-400 text-xs font-bold">PLAYING</span>
                  </div>
                ) : m ? (
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-yellow-400" />
                    <span className="text-yellow-400 text-xs">
                      {new Date(m.utcDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs">No fixture</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Upcoming</p>
          <div className="space-y-2">{upcoming.map((m) => <MatchRow key={m.id} m={m} />)}</div>
        </div>
      )}

      {/* Recent results */}
      {finished.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Recent Results</p>
          <div className="space-y-2">{finished.map((m) => <MatchRow key={m.id} m={m} />)}</div>
        </div>
      )}

      {/* Sub rules */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Live Sub Rules</p>
        {[
          { icon: CheckCircle, text: "Can sub a completed-match player for a bench player yet to play", color: "text-emerald-400" },
          { icon: Lock, text: "Cannot swap a player whose match is currently LIVE", color: "text-red-400" },
          { icon: Zap, text: "Any manual change CANCELS auto-subs for this round", color: "text-yellow-400" },
        ].map(({ icon: Icon, text, color }, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
            <p className="text-slate-300 text-xs">{text}</p>
          </div>
        ))}
        {lastSync && <p className="text-slate-600 text-[10px] mt-2">Last synced: {lastSync.toLocaleTimeString()}</p>}
      </div>
    </div>
  );
}
