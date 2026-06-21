"use client";
import { useFantasyStore } from "@/lib/store";
import { useState } from "react";
import { Crown, Shield } from "lucide-react";
import { usePointsSync } from "@/lib/use-points";

const FORMATION_ROWS = {
  GK: ["GK"],
  DEF: ["DEF", "DEF", "DEF", "DEF"],
  MID: ["MID", "MID", "MID", "MID"],
  FWD: ["FWD", "FWD"],
};

export default function SquadPage() {
  const { squad, playerPoints, playerBreakdown, playerRounds, totalPoints, setCaptain, setViceCaptain, swapStartingBench } = useFantasyStore();
  const BD_LABEL: Record<string, string> = { appearance: "Appearance", goals: "Goals", assists: "Assists", cleanSheet: "Clean sheet", conceded: "Goals conceded", cards: "Cards", ownGoals: "Own goals" };
  usePointsSync();
  const [selected, setSelected] = useState<number | null>(null);
  const starters = squad.filter((p) => p.isStarting);
  const bench = squad.filter((p) => !p.isStarting);
  const totalCost = squad.reduce((s, p) => s + p.price, 0);
  const nations = new Set(squad.map((p) => p.nation)).size;

  const gks = starters.filter((p) => p.position === "GK");
  const defs = starters.filter((p) => p.position === "DEF");
  const mids = starters.filter((p) => p.position === "MID");
  const fwds = starters.filter((p) => p.position === "FWD");

  const PlayerCard = ({ player }: { player: typeof squad[0] }) => (
    <button
      onClick={() => setSelected(selected === player.id ? null : player.id)}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${selected === player.id ? "ring-2 ring-emerald-400 bg-emerald-500/10" : "hover:bg-slate-800"}`}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl border-2 border-slate-600">
          {player.flag}
        </div>
        {player.isCaptain && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">C</span>}
        {player.isViceCaptain && <span className="absolute -top-1 -right-1 bg-slate-400 text-black text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">V</span>}
        {/* Live points badge */}
        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-slate-900">
          {playerPoints[player.id] ?? 0}
        </span>
      </div>
      <p className="text-white text-[10px] font-bold text-center leading-tight max-w-[64px] truncate">
        {player.knownName?.split(" ").pop() || player.lastName}
      </p>
      <p className="text-emerald-400 text-[9px]">${player.price}M</p>
      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
        player.position === "GK" ? "bg-yellow-500/20 text-yellow-400" :
        player.position === "DEF" ? "bg-blue-500/20 text-blue-400" :
        player.position === "MID" ? "bg-green-500/20 text-green-400" :
        "bg-red-500/20 text-red-400"}`}>{player.position}</span>

      {selected === player.id && (() => {
        const rounds = playerRounds[player.id] ?? {};
        const roundKeys = Object.keys(rounds).sort();
        return (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 border border-slate-600 rounded-xl p-3 z-50 min-w-[190px] max-h-72 overflow-y-auto text-left" onClick={(e) => e.stopPropagation()}>
            <p className="text-white text-xs font-bold mb-2">{player.knownName || player.lastName}</p>
            {roundKeys.length === 0 ? (
              <p className="text-slate-400 text-[10px] mb-2">No points yet — {player.nation} not played, or no contributions.</p>
            ) : (
              <div className="space-y-2 mb-2">
                {roundKeys.map((rk) => {
                  const bd = rounds[rk];
                  const rs = Object.keys(BD_LABEL).filter((k) => bd[k]);
                  return (
                    <div key={rk}>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 text-[10px] font-bold uppercase">{rk}</span>
                        <span className="text-emerald-400 text-[11px] font-bold">{bd.total}{bd.captain ? " (×2)" : ""}</span>
                      </div>
                      {rs.map((k) => (
                        <div key={k} className="flex justify-between gap-3 text-[10px] pl-1">
                          <span className="text-slate-400">{BD_LABEL[k]}</span>
                          <span className={(bd[k] as number) >= 0 ? "text-slate-200" : "text-red-400"}>{(bd[k] as number) >= 0 ? "+" : ""}{bd[k]}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div className="flex justify-between gap-3 text-[11px] font-bold border-t border-slate-600 pt-1">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">{playerPoints[player.id] ?? 0}</span>
                </div>
              </div>
            )}
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); setCaptain(player.id); setSelected(null); }}
                className="bg-yellow-500/20 text-yellow-400 text-[9px] px-2 py-1 rounded-lg font-bold flex-1">© Cap</button>
              <button onClick={(e) => { e.stopPropagation(); setViceCaptain(player.id); setSelected(null); }}
                className="bg-slate-600 text-slate-300 text-[9px] px-2 py-1 rounded-lg font-bold flex-1">VC</button>
            </div>
          </div>
        );
      })()}
    </button>
  );

  if (squad.length === 0) {
    return (
      <div className="px-4 py-16 max-w-lg mx-auto text-center space-y-4">
        <p className="text-5xl">🏟️</p>
        <p className="text-white font-bold text-xl">No Squad Yet</p>
        <p className="text-slate-400 text-sm">Build your 15-man team first — then manage it here on the pitch.</p>
        <div className="flex gap-2 justify-center">
          <a href="/transfers" className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-sm">⚽ Pick Players</a>
          <a href="/autobuilder" className="bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm">🪄 Auto-Build</a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* Stats Bar */}
      <div className="flex justify-between items-center mb-4 bg-slate-900 rounded-xl p-3 border border-slate-800">
        <div className="text-center"><p className="text-emerald-400 font-bold">{totalPoints}</p><p className="text-slate-500 text-xs">Points</p></div>
        <div className="text-center"><p className="text-white font-bold">${totalCost.toFixed(1)}M</p><p className="text-slate-500 text-xs">Budget</p></div>
        <div className="text-center"><p className="text-blue-400 font-bold">{nations}</p><p className="text-slate-500 text-xs">Nations</p></div>
        <div className="text-center"><p className="text-purple-400 font-bold">{starters.length}/11</p><p className="text-slate-500 text-xs">Starters</p></div>
      </div>

      {/* Pitch */}
      <div className="bg-gradient-to-b from-emerald-900/40 to-emerald-950/40 rounded-2xl border border-emerald-900/50 p-4 space-y-4">
        {/* FWDs */}
        <div className="flex justify-center gap-2">{fwds.map(p => <PlayerCard key={p.id} player={p} />)}</div>
        {/* MIDs */}
        <div className="flex justify-center gap-1">{mids.map(p => <PlayerCard key={p.id} player={p} />)}</div>
        {/* Mid line */}
        <div className="border-t border-emerald-800/50 border-dashed" />
        {/* DEFs */}
        <div className="flex justify-center gap-1">{defs.map(p => <PlayerCard key={p.id} player={p} />)}</div>
        {/* GK */}
        <div className="flex justify-center">{gks.map(p => <PlayerCard key={p.id} player={p} />)}</div>
        {/* Goal */}
        <div className="flex justify-center"><div className="w-24 h-5 border-2 border-white/20 rounded-t-sm" /></div>
      </div>

      {/* Bench */}
      <div className="mt-4 bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Bench</p>
        <div className="flex justify-around">{bench.map(p => <PlayerCard key={p.id} player={p} />)}</div>
      </div>

      {/* All Players List */}
      <div className="mt-4 bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Full Squad (15 Nations)</p>
        <div className="space-y-2">
          {squad.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.flag}</span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-white text-sm font-medium">{p.knownName || `${p.firstName} ${p.lastName}`}</p>
                    {p.isCaptain && <Crown size={10} className="text-yellow-400" />}
                  </div>
                  <p className="text-slate-400 text-xs">{p.nation} · {p.position} · {p.isStarting ? "Starting" : "Bench"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold text-sm">${p.price}M</p>
                <p className="text-slate-400 text-xs">{p.percentSelected}% owned</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between">
          <span className="text-slate-400 text-sm">Total Cost</span>
          <span className="text-emerald-400 font-bold">${totalCost.toFixed(1)}M / $100M</span>
        </div>
      </div>
    </div>
  );
}
