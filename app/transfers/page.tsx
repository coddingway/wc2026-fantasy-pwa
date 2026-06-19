"use client";
import { useState, useEffect } from "react";
import { useFantasyStore } from "@/lib/store";
import { Player, SquadPlayer } from "@/lib/types";
import { Search, ArrowRightLeft, Plus, X } from "lucide-react";
import { ROUNDS } from "@/lib/squad-data";
import { nationOf, POSITION_QUOTA } from "@/lib/nations";
import Link from "next/link";

export default function TransfersPage() {
  const { squad, freeTransfersRemaining, transfers, addPlayer, removePlayer, setSquad, addTransfer, setFreeTransfers } = useFantasyStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [selectedOut, setSelectedOut] = useState<number | null>(null);
  const [buildError, setBuildError] = useState("");
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    fetch("/players.json").then(r => r.json()).then(setPlayers);
  }, []);

  const currentRound = ROUNDS[1];
  const squadCost = squad.reduce((s, p) => s + p.price, 0);
  const remainingBudget = 100 - squadCost;
  const outPlayer = squad.find(s => s.id === selectedOut);

  // Transfer mode: pool limited to OUT player's position
  const filtered = players.filter(p =>
    p.status === "playing" &&
    !squad.some(s => s.id === p.id) &&
    (squad.length < 15 ? (posFilter === "ALL" || p.position === posFilter) : p.position === outPlayer?.position) &&
    ((p.knownName || `${p.firstName} ${p.lastName}`).toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 30);

  const doTransfer = (inP: Player) => {
    if (!outPlayer) return;
    if (squad.some(s => s.id === inP.id)) { setTransferError("Player already in squad"); return; }
    const n = nationOf(inP.squadId);
    const natCount = squad.filter(s => s.nation === n.code && s.id !== outPlayer.id).length;
    if (natCount >= 3) { setTransferError(`Max 3 players per nation (${n.code})`); return; }
    const inSp: SquadPlayer = {
      ...inP, nation: n.code, flag: n.flag,
      isStarting: outPlayer.isStarting, isCaptain: outPlayer.isCaptain, isViceCaptain: outPlayer.isViceCaptain,
    };
    setSquad(squad.map(s => s.id === outPlayer.id ? inSp : s));
    addTransfer({ out: outPlayer, in: inP, round: currentRound.name, date: new Date().toISOString() });
    setFreeTransfers(Math.max(0, freeTransfersRemaining - 1));
    setSelectedOut(null); setSearch(""); setTransferError("");
  };

  const handleAdd = (p: Player) => {
    const n = nationOf(p.squadId);
    const sp: SquadPlayer = {
      ...p, nation: n.code, flag: n.flag,
      isStarting: false, isCaptain: false, isViceCaptain: false,
    };
    const err = addPlayer(sp);
    setBuildError(err ?? "");
  };

  // ============ BUILD MODE — squad not complete yet ============
  if (squad.length < 15) {
    const posCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 } as Record<string, number>;
    squad.forEach(p => posCounts[p.position]++);
    return (
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-4">
          <p className="text-white font-bold text-lg">Build Your Squad</p>
          <p className="text-white/80 text-sm">Pick 15 players: 2 GK · 5 DEF · 5 MID · 3 FWD · max 3 per nation · $100M budget</p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(squad.length / 15) * 100}%` }} />
          </div>
          <p className="text-white/90 text-xs mt-1 font-bold">{squad.length}/15 players · ${remainingBudget.toFixed(1)}M left</p>
        </div>

        {/* Position quota tracker */}
        <div className="grid grid-cols-4 gap-2">
          {(["GK","DEF","MID","FWD"] as const).map(pos => (
            <div key={pos} className={`text-center rounded-xl p-2 border ${posCounts[pos] >= POSITION_QUOTA[pos] ? "bg-emerald-500/10 border-emerald-500/40" : "bg-slate-900 border-slate-800"}`}>
              <p className={`text-xs font-bold ${pos === "GK" ? "text-yellow-400" : pos === "DEF" ? "text-blue-400" : pos === "MID" ? "text-emerald-400" : "text-red-400"}`}>{pos}</p>
              <p className="text-white font-black">{posCounts[pos]}/{POSITION_QUOTA[pos]}</p>
            </div>
          ))}
        </div>

        {/* Quick option */}
        <Link href="/autobuilder" className="block bg-purple-600/20 border border-purple-500/40 rounded-xl p-3 text-center">
          <p className="text-purple-300 text-sm font-bold">🪄 In a hurry? Let the Auto-Builder pick all 15 for you →</p>
        </Link>

        {buildError && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3">
            <p className="text-red-400 text-sm font-semibold">⚠️ {buildError}</p>
          </div>
        )}

        {/* My picks so far */}
        {squad.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Your Picks ({squad.length})</p>
            <div className="space-y-1">
              {squad.map(p => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-slate-800 rounded-xl">
                  <span>{p.flag}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${p.position === "GK" ? "bg-yellow-500/20 text-yellow-400" : p.position === "DEF" ? "bg-blue-500/20 text-blue-400" : p.position === "MID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{p.position}</span>
                  <span className="text-white text-sm flex-1 truncate">{p.knownName || `${p.firstName} ${p.lastName}`}</span>
                  <span className="text-emerald-400 text-sm font-bold">${p.price}M</span>
                  <button onClick={() => { removePlayer(p.id); setBuildError(""); }} className="p-1 rounded-lg bg-red-500/10 text-red-400">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player pool */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-emerald-500/30">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Player Pool — tap + to add</p>
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
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map(p => {
              const n = nationOf(p.squadId);
              const inSquad = squad.some(s => s.id === p.id);
              return (
                <div key={p.id} className={`flex items-center justify-between p-2 rounded-xl ${inSquad ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800"}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{n.flag}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{p.knownName || `${p.firstName} ${p.lastName}`}</p>
                      <p className="text-slate-400 text-xs">{p.position} · {n.code} · {p.percentSelected}% owned</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-emerald-400 text-sm font-bold">${p.price}M</span>
                    {inSquad ? (
                      <span className="text-emerald-400 text-xs font-bold">✓</span>
                    ) : (
                      <button onClick={() => handleAdd(p)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg">
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============ TRANSFER MODE — squad complete ============
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
          {transferError && <p className="text-red-400 text-sm mb-2">⚠️ {transferError}</p>}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filtered.map(p => {
              const name = p.knownName || `${p.firstName} ${p.lastName}`;
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
                    {canAfford ? (
                      <button onClick={() => doTransfer(p)} className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                        <ArrowRightLeft size={12} /> IN
                      </button>
                    ) : <span className="text-red-400 text-[10px]">over budget</span>}
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
