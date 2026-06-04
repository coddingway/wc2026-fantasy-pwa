"use client";
import { useState } from "react";
import { useFantasyStore } from "@/lib/store";
import { SquadPlayer } from "@/lib/types";
import { Users, Plus, Trash2, Trophy, ArrowRight } from "lucide-react";

interface SavedTeam {
  id: string;
  name: string;
  squad: SquadPlayer[];
  createdAt: string;
  points: number;
  strategy: string;
}

export default function MultiTeamPage() {
  const { squad, teamName, totalPoints } = useFantasyStore();
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([
    {
      id: "main",
      name: teamName,
      squad,
      createdAt: new Date().toISOString(),
      points: totalPoints,
      strategy: "Main Squad — 15 nations, $100M",
    },
  ]);
  const [newName, setNewName] = useState("");
  const [comparing, setComparing] = useState<[string, string] | null>(null);

  const saveCurrentSquad = () => {
    if (!newName.trim()) return;
    const team: SavedTeam = {
      id: Date.now().toString(),
      name: newName,
      squad: [...squad],
      createdAt: new Date().toISOString(),
      points: totalPoints,
      strategy: `${new Set(squad.map(p => p.nation)).size} nations · $${squad.reduce((s,p)=>s+p.price,0).toFixed(1)}M`,
    };
    setSavedTeams(t => [...t, team]);
    setNewName("");
  };

  const deleteTeam = (id: string) => {
    if (id === "main") return;
    setSavedTeams(t => t.filter(team => team.id !== id));
  };

  const getStats = (sq: SquadPlayer[]) => ({
    cost: sq.reduce((s,p)=>s+p.price,0).toFixed(1),
    nations: new Set(sq.map(p=>p.nation)).size,
    starters: sq.filter(p=>p.isStarting).length,
    captain: sq.find(p=>p.isCaptain),
    avgPrice: (sq.reduce((s,p)=>s+p.price,0)/sq.length).toFixed(1),
  });

  const teamA = comparing ? savedTeams.find(t=>t.id===comparing[0]) : null;
  const teamB = comparing ? savedTeams.find(t=>t.id===comparing[1]) : null;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl p-4">
        <Users size={24} className="text-teal-200 mb-2" />
        <p className="text-white font-bold text-lg">Multi-Team Manager</p>
        <p className="text-white/80 text-sm">Save multiple squads · A/B test strategies · Compare performance</p>
      </div>

      {/* Save Current Squad */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Save Current Squad as New Team</p>
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Team name (e.g. Attack Mode, Safe Squad...)"
            className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500" />
          <button onClick={saveCurrentSquad} disabled={!newName.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl font-bold transition-all">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {savedTeams.map(team => {
          const stats = getStats(team.squad);
          const isCompareA = comparing?.[0] === team.id;
          const isCompareB = comparing?.[1] === team.id;
          return (
            <div key={team.id} className={`bg-slate-900 rounded-2xl p-4 border transition-all ${isCompareA ? "border-blue-500" : isCompareB ? "border-orange-500" : "border-slate-800"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-bold">{team.name}</p>
                  <p className="text-slate-400 text-xs">{team.strategy}</p>
                </div>
                <div className="flex gap-1">
                  {team.id !== "main" && (
                    <button onClick={() => deleteTeam(team.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center bg-slate-800 rounded-lg p-1.5">
                  <p className="text-emerald-400 font-bold text-sm">${stats.cost}M</p>
                  <p className="text-slate-500 text-[9px]">Cost</p>
                </div>
                <div className="text-center bg-slate-800 rounded-lg p-1.5">
                  <p className="text-blue-400 font-bold text-sm">{stats.nations}</p>
                  <p className="text-slate-500 text-[9px]">Nations</p>
                </div>
                <div className="text-center bg-slate-800 rounded-lg p-1.5">
                  <p className="text-yellow-400 font-bold text-sm">{team.points}</p>
                  <p className="text-slate-500 text-[9px]">Points</p>
                </div>
                <div className="text-center bg-slate-800 rounded-lg p-1.5">
                  <p className="text-purple-400 font-bold text-sm">${stats.avgPrice}M</p>
                  <p className="text-slate-500 text-[9px]">Avg Price</p>
                </div>
              </div>

              {/* Captain */}
              {stats.captain && (
                <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2 mb-3">
                  <span>{stats.captain.flag}</span>
                  <span className="text-yellow-400 text-xs font-semibold">© {stats.captain.knownName || stats.captain.lastName}</span>
                  <span className="text-slate-400 text-xs ml-auto">${stats.captain.price}M</span>
                </div>
              )}

              {/* Players Preview */}
              <div className="flex flex-wrap gap-1">
                {team.squad.filter(p=>p.isStarting).map(p => (
                  <span key={p.id} title={p.knownName || p.lastName} className="text-base">{p.flag}</span>
                ))}
              </div>

              {/* Compare Toggle */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    if (isCompareA) {
                      setComparing(null);
                    } else if (!comparing) {
                      setComparing([team.id, ""]);
                    } else if (comparing[0] && !comparing[1]) {
                      setComparing([comparing[0], team.id]);
                    } else {
                      setComparing([team.id, ""]);
                    }
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isCompareA ? "bg-blue-600 text-white" : isCompareB ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {isCompareA ? "Team A ✓" : isCompareB ? "Team B ✓" : "Compare"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Panel */}
      {teamA && teamB && teamB.id !== "" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <p className="text-white font-bold mb-4 text-center">Head-to-Head Comparison</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Points", a: teamA.points, b: teamB.points, format: (v: number) => `${v}` },
              { label: "Nations", a: getStats(teamA.squad).nations, b: getStats(teamB.squad).nations, format: (v: number) => `${v}` },
              { label: "Cost", a: parseFloat(getStats(teamA.squad).cost), b: parseFloat(getStats(teamB.squad).cost), format: (v: number) => `$${v}M` },
            ].map(({ label, a, b, format }) => (
              <div key={label} className="text-center">
                <div className={`p-2 rounded-t-xl ${a > b ? "bg-blue-600" : "bg-slate-700"}`}>
                  <p className="text-white font-black">{format(a)}</p>
                </div>
                <div className="bg-slate-800 py-1">
                  <p className="text-slate-400 text-[10px]">{label}</p>
                </div>
                <div className={`p-2 rounded-b-xl ${b > a ? "bg-orange-600" : "bg-slate-700"}`}>
                  <p className="text-white font-black">{format(b)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-800">
            <span className="text-blue-400 text-sm font-bold">{teamA.name}</span>
            <span className="text-slate-400 text-xs">vs</span>
            <span className="text-orange-400 text-sm font-bold">{teamB.name}</span>
          </div>
        </div>
      )}

      {comparing && !comparing[1] && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
          <p className="text-blue-400 text-sm">Now select Team B to compare</p>
        </div>
      )}
    </div>
  );
}
