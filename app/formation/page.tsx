"use client";
import { useState } from "react";
import { useFantasyStore } from "@/lib/store";
import { SquadPlayer } from "@/lib/types";

type Formation = "4-4-2" | "4-3-3" | "3-5-2" | "3-4-3" | "5-3-2" | "4-5-1" | "5-4-1";

const FORMATIONS: Record<Formation, { def: number; mid: number; fwd: number; label: string }> = {
  "4-4-2": { def: 4, mid: 4, fwd: 2, label: "Balanced" },
  "4-3-3": { def: 4, mid: 3, fwd: 3, label: "Attack" },
  "3-5-2": { def: 3, mid: 5, fwd: 2, label: "Midfield" },
  "3-4-3": { def: 3, mid: 4, fwd: 3, label: "All-Out Attack" },
  "5-3-2": { def: 5, mid: 3, fwd: 2, label: "Defensive" },
  "4-5-1": { def: 4, mid: 5, fwd: 1, label: "Counter" },
  "5-4-1": { def: 5, mid: 4, fwd: 1, label: "Ultra Defensive" },
};

const posColor = (pos: string) =>
  pos === "GK" ? "bg-yellow-600" :
  pos === "DEF" ? "bg-blue-700" :
  pos === "MID" ? "bg-emerald-700" : "bg-red-700";

function PitchSlot({ player, onClick }: { player: SquadPlayer | null; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 group">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
        player ? `${posColor(player.position)} border-white/40 group-hover:border-white` : "border-dashed border-white/20 bg-white/5 group-hover:border-white/40"}`}>
        {player ? player.flag : <span className="text-white/30 text-xs">+</span>}
      </div>
      {player && (
        <div className="text-center">
          <p className="text-white text-[9px] font-bold leading-tight max-w-[48px] truncate">
            {(player.knownName || player.lastName).split(" ").pop()}
          </p>
          {player.isCaptain && <span className="text-yellow-400 text-[8px] font-black">©</span>}
        </div>
      )}
      {!player && <p className="text-white/20 text-[9px]">Empty</p>}
    </button>
  );
}

export default function FormationPage() {
  const { squad, setSquad } = useFantasyStore();
  const [formation, setFormation] = useState<Formation>("4-4-2");
  const [dragging, setDragging] = useState<number | null>(null);
  const [swapMode, setSwapMode] = useState<number | null>(null);

  const starters = squad.filter(p => p.isStarting);
  const bench = squad.filter(p => !p.isStarting);
  const { def, mid, fwd } = FORMATIONS[formation];

  const gks = starters.filter(p => p.position === "GK");
  const defs = starters.filter(p => p.position === "DEF").slice(0, def);
  const mids = starters.filter(p => p.position === "MID").slice(0, mid);
  const fwds = starters.filter(p => p.position === "FWD").slice(0, fwd);

  const applyFormation = (f: Formation) => {
    setFormation(f);
    const { def: d, mid: m, fwd: fw } = FORMATIONS[f];
    const gkStarters = squad.filter(p => p.position === "GK").slice(0, 1);
    const defStarters = squad.filter(p => p.position === "DEF").slice(0, d);
    const midStarters = squad.filter(p => p.position === "MID").slice(0, m);
    const fwdStarters = squad.filter(p => p.position === "FWD").slice(0, fw);
    const starterIds = new Set([...gkStarters, ...defStarters, ...midStarters, ...fwdStarters].map(p => p.id));
    setSquad(squad.map(p => ({ ...p, isStarting: starterIds.has(p.id) })));
  };

  const handleSlotClick = (playerId: number) => {
    if (swapMode === null) {
      setSwapMode(playerId);
    } else if (swapMode === playerId) {
      setSwapMode(null);
    } else {
      const updated = squad.map(p => {
        if (p.id === swapMode) return { ...p, isStarting: squad.find(q => q.id === playerId)?.isStarting ?? p.isStarting };
        if (p.id === playerId) return { ...p, isStarting: squad.find(q => q.id === swapMode)?.isStarting ?? p.isStarting };
        return p;
      });
      setSquad(updated);
      setSwapMode(null);
    }
  };

  const totalExpectedPts = starters.reduce((s, p) =>
    s + (p.position === "GK" ? 8 : p.position === "DEF" ? 7 : p.position === "MID" ? 9 : 6), 0);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-4">
        <p className="text-white font-bold text-lg">Formation Optimizer</p>
        <p className="text-white/80 text-sm">Switch formations, swap players, maximize expected points</p>
      </div>

      {/* Formation Selector */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Select Formation</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FORMATIONS) as Formation[]).map(f => (
            <button key={f} onClick={() => applyFormation(f)}
              className={`p-3 rounded-xl border text-left transition-all ${formation === f ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-600"}`}>
              <p className="text-white font-bold">{f}</p>
              <p className="text-slate-400 text-xs">{FORMATIONS[f].label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Swap Hint */}
      {swapMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-3 text-center">
          <p className="text-yellow-400 text-sm font-semibold">
            {squad.find(p => p.id === swapMode)?.knownName || squad.find(p => p.id === swapMode)?.lastName} selected — tap another player to swap
          </p>
        </div>
      )}

      {/* Pitch */}
      <div className="bg-gradient-to-b from-emerald-900/50 to-emerald-950/60 rounded-2xl border border-emerald-900/50 p-4">
        <p className="text-center text-emerald-400/60 text-xs mb-3 uppercase">{formation}</p>

        {/* FWDs */}
        <div className="flex justify-center gap-3 mb-4">
          {fwds.map(p => <PitchSlot key={p.id} player={p} onClick={() => handleSlotClick(p.id)} />)}
          {Array.from({ length: Math.max(0, fwd - fwds.length) }).map((_, i) => (
            <PitchSlot key={`e-fwd-${i}`} player={null} onClick={() => {}} />))}
        </div>

        {/* MIDs */}
        <div className="flex justify-center gap-2 mb-4">
          {mids.map(p => <PitchSlot key={p.id} player={p} onClick={() => handleSlotClick(p.id)} />)}
          {Array.from({ length: Math.max(0, mid - mids.length) }).map((_, i) => (
            <PitchSlot key={`e-mid-${i}`} player={null} onClick={() => {}} />))}
        </div>

        <div className="border-t border-emerald-800/30 border-dashed my-2" />

        {/* DEFs */}
        <div className="flex justify-center gap-2 mb-4">
          {defs.map(p => <PitchSlot key={p.id} player={p} onClick={() => handleSlotClick(p.id)} />)}
          {Array.from({ length: Math.max(0, def - defs.length) }).map((_, i) => (
            <PitchSlot key={`e-def-${i}`} player={null} onClick={() => {}} />))}
        </div>

        {/* GK */}
        <div className="flex justify-center mb-2">
          {gks.map(p => <PitchSlot key={p.id} player={p} onClick={() => handleSlotClick(p.id)} />)}
        </div>
        <div className="flex justify-center">
          <div className="w-20 h-4 border-2 border-white/10 rounded-t-sm" />
        </div>
      </div>

      {/* Expected Points */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <p className="text-slate-400 text-xs font-semibold uppercase">Formation Stats</p>
          <span className="text-emerald-400 font-bold">{totalExpectedPts} est. pts</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {["GK","DEF","MID","FWD"].map(pos => {
            const count = starters.filter(p => p.position === pos).length;
            const budget = starters.filter(p => p.position === pos).reduce((s, p) => s + p.price, 0);
            return (
              <div key={pos} className="bg-slate-800 rounded-xl p-2">
                <p className={`text-xs font-bold ${pos === "GK" ? "text-yellow-400" : pos === "DEF" ? "text-blue-400" : pos === "MID" ? "text-emerald-400" : "text-red-400"}`}>{pos}</p>
                <p className="text-white font-black">{count}</p>
                <p className="text-slate-400 text-[10px]">${budget.toFixed(1)}M</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Bench (tap to swap)</p>
        <div className="flex justify-around">
          {bench.map(p => <PitchSlot key={p.id} player={p} onClick={() => handleSlotClick(p.id)} />)}
        </div>
      </div>
    </div>
  );
}
