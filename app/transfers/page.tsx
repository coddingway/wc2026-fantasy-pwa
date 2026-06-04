"use client";
import { useState, useEffect } from "react";
import { useFantasyStore } from "@/lib/store";
import { Player } from "@/lib/types";
import { Search, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { ROUNDS } from "@/lib/squad-data";

export default function TransfersPage() {
  const { squad, freeTransfersRemaining, transfers } = useFantasyStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [selectedOut, setSelectedOut] = useState<number | null>(null);

  useEffect(() => {
    fetch("/players.json").then(r => r.json()).then(setPlayers);
  }, []);

  const currentRound = ROUNDS[1];
  const squadCost = squad.reduce((s, p) => s + p.price, 0);
  const remainingBudget = 100 - squadCost;

  const filtered = players.filter(p =>
    p.status === "playing" &&
    (posFilter === "ALL" || p.position === posFilter) &&
    ((p.knownName || `${p.firstName} ${p.lastName}`).toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 30);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Transfer Window Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-4">
        <p className="text-white font-bold">Transfer Window Open</p>
        <p className="text-white/80 text-sm">{currentRound.name} · {freeTransfersRemaining} free transfers remaining</p>
        <p className="text-white/60 text-xs mt-1">Extra transfers cost -3 pts each</p>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-bold">${remainingBudget.toFixed(1)}M</p>
          <p className="text-slate-400 text-xs">Available</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-blue-400 font-bold">{freeTransfersRemaining}</p>
          <p className="text-slate-400 text-xs">Free Left</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-orange-400 font-bold">{transfers.length}</p>
          <p className="text-slate-400 text-xs">Made</p>
        </div>
      </div>

      {/* Current Squad - Transfer Out */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Select Player to Transfer OUT</p>
        <div className="space-y-2">
          {squad.map(p => (
            <button key={p.id} onClick={() => setSelectedOut(selectedOut === p.id ? null : p.id)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${selectedOut === p.id ? "bg-red-500/20 border border-red-500/50" : "bg-slate-800 hover:bg-slate-700"}`}>
              <div className="flex items-center gap-2">
                <span>{p.flag}</span>
                <div className="text-left">
                  <p className="text-white text-sm">{p.knownName || p.lastName}</p>
                  <p className="text-slate-400 text-xs">{p.nation} · {p.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm font-bold">${p.price}M</span>
                {selectedOut === p.id && <span className="text-red-400 text-xs">OUT</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Player Pool - Transfer In */}
      {selectedOut && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-emerald-500/30">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Select Player to Transfer IN</p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search players..." className="w-full bg-slate-800 text-white text-sm pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500" />
            </div>
            <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
              className="bg-slate-800 text-white text-sm px-3 py-2 rounded-xl border border-slate-700">
              {["ALL","GK","DEF","MID","FWD"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filtered.map(p => {
              const name = p.knownName || `${p.firstName} ${p.lastName}`;
              const outPlayer = squad.find(s => s.id === selectedOut);
              const budgetAfter = remainingBudget + (outPlayer?.price || 0) - p.price;
              const canAfford = budgetAfter >= 0;
              return (
                <div key={p.id} className={`flex items-center justify-between p-2 rounded-xl ${canAfford ? "bg-slate-800 hover:bg-emerald-500/10" : "bg-slate-800/50 opacity-50"}`}>
                  <div>
                    <p className="text-white text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{p.position} · {p.percentSelected}% owned</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm font-bold">${p.price}M</span>
                    {canAfford && (
                      <button className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-lg font-bold">
                        <ArrowRightLeft size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transfer History */}
      {transfers.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Transfer History</p>
          {transfers.map((t, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-800 rounded-xl mb-2">
              <span className="text-red-400 text-sm">{t.out.knownName || t.out.lastName}</span>
              <ArrowRightLeft size={12} className="text-slate-400" />
              <span className="text-emerald-400 text-sm">{t.in.knownName || `${t.in.firstName} ${t.in.lastName}`}</span>
              <span className="ml-auto text-slate-400 text-xs">{t.round}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Windows */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Upcoming Windows</p>
        {ROUNDS.map(r => (
          <div key={r.id} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
            <div>
              <p className="text-white text-sm">{r.name}</p>
              <p className="text-slate-400 text-xs">{r.date}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-sm font-bold">{r.freeTransfers === 99 ? "∞" : r.freeTransfers} free</p>
              {r.budgetBoost > 0 && <p className="text-yellow-400 text-xs">+${r.budgetBoost}M boost</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
