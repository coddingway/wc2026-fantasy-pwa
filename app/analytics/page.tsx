"use client";
import { useFantasyStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#84cc16"];

const MOCK_ROUND_DATA = [
  { round: "MD1", points: 0, avg: 42 },
  { round: "MD2", points: 0, avg: 38 },
  { round: "MD3", points: 0, avg: 41 },
  { round: "R32", points: 0, avg: 55 },
];

const MOCK_POSITION_DATA = [
  { name: "GK", points: 0, expected: 12 },
  { name: "DEF", points: 0, expected: 28 },
  { name: "MID", points: 0, expected: 35 },
  { name: "FWD", points: 0, expected: 25 },
];

export default function AnalyticsPage() {
  const { squad, totalPoints, roundPoints } = useFantasyStore();
  const nations = [...new Set(squad.map(p => p.nation))];
  const priceByPos = ["GK","DEF","MID","FWD"].map(pos => ({
    name: pos,
    value: squad.filter(p => p.position === pos).reduce((s, p) => s + p.price, 0),
  }));

  const ownershipData = squad.slice(0,8).map(p => ({
    name: (p.knownName || p.lastName).split(" ").pop(),
    ownership: p.percentSelected,
  })).sort((a,b) => b.ownership - a.ownership);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <p className="text-slate-400 text-xs">Total Points</p>
          <p className="text-white text-2xl font-black">{totalPoints}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <p className="text-slate-400 text-xs">Avg/Round</p>
          <p className="text-white text-2xl font-black">{Object.keys(roundPoints).length ? (totalPoints / Object.keys(roundPoints).length).toFixed(0) : 0}</p>
        </div>
      </div>

      {/* Points by Round */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Points Per Round</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={MOCK_ROUND_DATA}>
            <XAxis dataKey="round" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            <Bar dataKey="points" fill="#10b981" radius={[4,4,0,0]} name="Your Points" />
            <Bar dataKey="avg" fill="#334155" radius={[4,4,0,0]} name="Avg" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Distribution */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Budget by Position</p>
        <div className="flex gap-4">
          <PieChart width={120} height={120}>
            <Pie data={priceByPos} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
              {priceByPos.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
          </PieChart>
          <div className="flex-1 space-y-2">
            {priceByPos.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-slate-300 text-sm">{d.name}</span>
                </div>
                <span className="text-white font-bold text-sm">${d.value.toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ownership vs Squad */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Your Players % Ownership</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ownershipData} layout="vertical">
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={60} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            <Bar dataKey="ownership" fill="#3b82f6" radius={[0,4,4,0]} name="% Owned" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nation Coverage */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Nation Coverage ({nations.length} nations)</p>
        <div className="flex flex-wrap gap-2">
          {squad.map(p => (
            <div key={p.id} className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
              <span>{p.flag}</span>
              <span className="text-slate-300 text-xs">{p.nation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Efficiency */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Season Stats</p>
        {[
          { label: "Squad Value", value: "$100.0M", sub: "Budget used" },
          { label: "Nations Covered", value: "15", sub: "Max diversity" },
          { label: "Differential Picks", value: "7", sub: "Under 15% owned" },
          { label: "Transfers Made", value: "0", sub: "This tournament" },
          { label: "Boosters Available", value: "5/5", sub: "All ready to use" },
        ].map(s => (
          <div key={s.label} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
            <div>
              <p className="text-white text-sm">{s.label}</p>
              <p className="text-slate-400 text-xs">{s.sub}</p>
            </div>
            <p className="text-emerald-400 font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
