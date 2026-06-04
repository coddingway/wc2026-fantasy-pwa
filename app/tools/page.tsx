"use client";
import { useState, useEffect } from "react";
import { Player } from "@/lib/types";
import { Settings, Filter, Download, Search, BarChart2 } from "lucide-react";

export default function ToolsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [pos, setPos] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState(11);
  const [minOwn, setMinOwn] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"price" | "percentSelected">("price");

  useEffect(() => { fetch("/players.json").then(r => r.json()).then(setPlayers); }, []);

  const filtered = players
    .filter(p => p.status === "playing")
    .filter(p => pos === "ALL" || p.position === pos)
    .filter(p => p.price <= maxPrice)
    .filter(p => p.percentSelected >= minOwn)
    .filter(p => (p.knownName || `${p.firstName} ${p.lastName}`).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sort] - a[sort])
    .slice(0, 50);

  const exportCSV = () => {
    const header = "Name,Position,Price,Owned%,Status";
    const rows = filtered.map(p => `${p.knownName || p.firstName + " " + p.lastName},${p.position},${p.price},${p.percentSelected},${p.status}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wc2026_players.csv"; a.click();
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl p-4">
        <Settings size={24} className="text-slate-300 mb-2" />
        <p className="text-white font-bold text-lg">Power User Tools</p>
        <p className="text-white/80 text-sm">1,481 players · Filter · Sort · Export</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search any player..."
          className="w-full bg-slate-900 border border-slate-700 text-white text-sm pl-8 pr-3 py-3 rounded-xl focus:outline-none focus:border-emerald-500" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={14} className="text-emerald-400" />
          <p className="text-slate-400 text-xs font-semibold uppercase">Filters</p>
        </div>
        <div className="flex gap-2">
          {["ALL","GK","DEF","MID","FWD"].map(p => (
            <button key={p} onClick={() => setPos(p)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${pos === p ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>{p}</button>
          ))}
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Max Price: ${maxPrice}M</p>
          <input type="range" min={3.5} max={11} step={0.1} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-emerald-500" />
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Min Ownership: {minOwn}%</p>
          <input type="range" min={0} max={50} step={0.5} value={minOwn} onChange={e => setMinOwn(Number(e.target.value))}
            className="w-full accent-emerald-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSort("price")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${sort === "price" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>Sort by Price</button>
          <button onClick={() => setSort("percentSelected")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${sort === "percentSelected" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>Sort by Owned%</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-between bg-slate-900 rounded-xl p-3 border border-slate-800">
        <span className="text-slate-400 text-sm">{filtered.length} players shown</span>
        <button onClick={exportCSV} className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Player List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase">
          <span className="col-span-2">Player</span><span>Price</span><span>Owned</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filtered.map(p => {
            const name = p.knownName || `${p.firstName} ${p.lastName}`;
            return (
              <div key={p.id} className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-slate-800 hover:bg-slate-800/50">
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <span className={`text-[9px] px-1 py-0.5 rounded font-bold flex-shrink-0 ${p.position === "GK" ? "bg-yellow-500/20 text-yellow-400" : p.position === "DEF" ? "bg-blue-500/20 text-blue-400" : p.position === "MID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{p.position}</span>
                  <span className="text-white text-xs truncate">{name}</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold">${p.price}M</span>
                <span className="text-slate-300 text-xs">{p.percentSelected}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Piece Bible */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Set Piece Bible</p>
        {[
          { nation: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", pen: "Kane", fk: "Bellingham/Saka", corners: "Trippier" },
          { nation: "🇦🇷 Argentina", pen: "Messi (if fit)", fk: "Messi", corners: "Di María alt" },
          { nation: "🇵🇹 Portugal", pen: "Bruno Fernandes", fk: "Bruno Fernandes", corners: "Bruno" },
          { nation: "🇫🇷 France", pen: "Mbappé", fk: "Griezmann/Mbappé", corners: "Theo" },
          { nation: "🇪🇸 Spain", pen: "Oyarzabal", fk: "Yamal", corners: "Cucurella" },
          { nation: "🇩🇪 Germany", pen: "Kimmich", fk: "Wirtz/Kimmich", corners: "Kimmich" },
          { nation: "🇹🇷 Turkey", pen: "Çalhanoğlu", fk: "Güler", corners: "Güler" },
        ].map(r => (
          <div key={r.nation} className="py-2 border-b border-slate-800 last:border-0">
            <p className="text-white text-sm font-medium">{r.nation}</p>
            <p className="text-slate-400 text-xs">Pen: {r.pen} · FK: {r.fk} · Corners: {r.corners}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
