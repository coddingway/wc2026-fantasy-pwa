"use client";
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/lib/types";
import { Heart, X, Star, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const NATION_MAP: Record<number, { code: string; flag: string }> = {
  1:{code:"ALG",flag:"🇩🇿"},2:{code:"ARG",flag:"🇦🇷"},3:{code:"AUS",flag:"🇦🇺"},4:{code:"AUT",flag:"🇦🇹"},
  5:{code:"BEL",flag:"🇧🇪"},6:{code:"BIH",flag:"🇧🇦"},7:{code:"BRA",flag:"🇧🇷"},9:{code:"CAN",flag:"🇨🇦"},
  10:{code:"URU",flag:"🇺🇾"},11:{code:"CIV",flag:"🇨🇮"},12:{code:"CIV",flag:"🇨🇮"},13:{code:"CRO",flag:"🇭🇷"},
  14:{code:"CUW",flag:"🇨🇼"},15:{code:"CZE",flag:"🇨🇿"},16:{code:"ECU",flag:"🇪🇨"},17:{code:"EGY",flag:"🇪🇬"},
  18:{code:"ENG",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},19:{code:"FRA",flag:"🇫🇷"},20:{code:"GER",flag:"🇩🇪"},21:{code:"GHA",flag:"🇬🇭"},
  22:{code:"HAI",flag:"🇭🇹"},23:{code:"IRN",flag:"🇮🇷"},24:{code:"IRQ",flag:"🇮🇶"},25:{code:"JPN",flag:"🇯🇵"},
  26:{code:"JOR",flag:"🇯🇴"},27:{code:"KOR",flag:"🇰🇷"},28:{code:"MEX",flag:"🇲🇽"},29:{code:"MAR",flag:"🇲🇦"},
  30:{code:"NED",flag:"🇳🇱"},31:{code:"NZL",flag:"🇳🇿"},32:{code:"NOR",flag:"🇳🇴"},33:{code:"PAN",flag:"🇵🇦"},
  34:{code:"URU",flag:"🇺🇾"},35:{code:"POR",flag:"🇵🇹"},36:{code:"QAT",flag:"🇶🇦"},37:{code:"KSA",flag:"🇸🇦"},
  38:{code:"SCO",flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿"},39:{code:"SEN",flag:"🇸🇳"},40:{code:"RSA",flag:"🇿🇦"},41:{code:"ESP",flag:"🇪🇸"},
  42:{code:"SWE",flag:"🇸🇪"},43:{code:"SUI",flag:"🇨🇭"},44:{code:"TUN",flag:"🇹🇳"},45:{code:"TUR",flag:"🇹🇷"},
  46:{code:"URU",flag:"🇺🇾"},47:{code:"USA",flag:"🇺🇸"},48:{code:"UZB",flag:"🇺🇿"},
};

const posColor = (pos: string) =>
  pos === "GK" ? "from-yellow-800 to-yellow-900" :
  pos === "DEF" ? "from-blue-800 to-blue-900" :
  pos === "MID" ? "from-emerald-800 to-emerald-900" : "from-red-800 to-red-900";

const posBadge = (pos: string) =>
  pos === "GK" ? "bg-yellow-500/20 text-yellow-400" :
  pos === "DEF" ? "bg-blue-500/20 text-blue-400" :
  pos === "MID" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [passed, setPassed] = useState<number[]>([]);
  const [pos, setPos] = useState("ALL");
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    fetch("/players.json").then(r => r.json()).then((data: Player[]) => {
      const filtered = data.filter(p => p.status === "playing" && p.percentSelected > 0.5)
        .sort((a, b) => b.percentSelected - a.percentSelected);
      setPlayers(filtered);
    });
  }, []);

  const filtered = players.filter(p => pos === "ALL" || p.position === pos);
  const current = filtered[index];

  const handleLike = useCallback(() => {
    if (!current) return;
    setSwipe("right");
    setLiked(l => [...l, current.id]);
    setTimeout(() => { setSwipe(null); setIndex(i => i + 1); }, 300);
  }, [current]);

  const handlePass = useCallback(() => {
    if (!current) return;
    setSwipe("left");
    setPassed(p => [...p, current.id]);
    setTimeout(() => { setSwipe(null); setIndex(i => i + 1); }, 300);
  }, [current]);

  const nation = current ? NATION_MAP[current.squadId] : null;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-4">
        <p className="text-white font-bold text-lg">Player Deep Dive</p>
        <p className="text-white/80 text-sm">Swipe right ❤️ to watchlist · Left ✕ to skip</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-white/70">❤️ {liked.length} watchlisted</span>
          <span className="text-white/70">✕ {passed.length} skipped</span>
          <span className="text-white/70">#{index + 1} of {filtered.length}</span>
        </div>
      </div>

      {/* Position Filter */}
      <div className="flex gap-1">
        {["ALL","GK","DEF","MID","FWD"].map(p => (
          <button key={p} onClick={() => { setPos(p); setIndex(0); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${pos === p ? "bg-pink-600 text-white" : "bg-slate-800 text-slate-400"}`}>{p}</button>
        ))}
      </div>

      {/* Card */}
      {current ? (
        <div className={`transition-all duration-300 ${swipe === "right" ? "translate-x-8 rotate-3 opacity-0" : swipe === "left" ? "-translate-x-8 -rotate-3 opacity-0" : ""}`}>
          <div className={`bg-gradient-to-b ${posColor(current.position)} rounded-3xl p-6 border border-white/10 shadow-2xl`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${posBadge(current.position)}`}>{current.position}</span>
                <p className="text-white font-black text-2xl mt-2">{current.knownName || `${current.firstName} ${current.lastName}`}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{nation?.flag || "🏳️"}</span>
                  <span className="text-white/70 text-sm">{nation?.code || "UNK"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Price</p>
                <p className="text-white font-black text-3xl">${current.price}M</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/20 rounded-2xl p-3">
                <p className="text-white/60 text-xs">% Selected</p>
                <p className="text-white font-black text-2xl">{current.percentSelected}%</p>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                  <div className="bg-white rounded-full h-1.5" style={{ width: `${Math.min(current.percentSelected * 2, 100)}%` }} />
                </div>
              </div>
              <div className="bg-black/20 rounded-2xl p-3">
                <p className="text-white/60 text-xs">Status</p>
                <p className="text-emerald-400 font-black text-lg mt-1 capitalize">{current.status}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white/60 text-xs">Available</span>
                </div>
              </div>
            </div>

            {/* Ownership Popularity */}
            <div className="bg-black/20 rounded-2xl p-3 mb-4">
              <p className="text-white/60 text-xs mb-2">Popularity Ranking</p>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={current.percentSelected > s * 10 ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                ))}
                <span className="text-white/60 text-xs ml-1">{current.percentSelected < 10 ? "Hidden gem" : current.percentSelected < 30 ? "Popular" : "Widely owned"}</span>
              </div>
            </div>

            {/* Fantasy Score */}
            <div className="bg-black/20 rounded-2xl p-3">
              <p className="text-white/60 text-xs mb-1">Fantasy Value Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-3">
                  <div className="bg-gradient-to-r from-emerald-400 to-blue-400 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((current.price / 10.5) * 100, 100)}%` }} />
                </div>
                <span className="text-white font-bold">{((current.price / 10.5) * 10).toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button onClick={handlePass}
              className="flex-1 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              <X size={24} className="text-red-400" /> Skip
            </button>
            <button onClick={handleLike}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              <Heart size={24} /> Watch
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-white font-bold text-xl">You've seen all players!</p>
          <p className="text-slate-400 text-sm mt-1">❤️ {liked.length} on your watchlist</p>
          <button onClick={() => { setIndex(0); setLiked([]); setPassed([]); }}
            className="mt-4 bg-pink-600 text-white px-6 py-3 rounded-xl font-bold">Start Over</button>
        </div>
      )}

      {/* Watchlist */}
      {liked.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-pink-500/20">
          <p className="text-pink-400 font-semibold text-sm mb-3">❤️ Your Watchlist ({liked.length})</p>
          <div className="flex flex-wrap gap-1">
            {liked.map(id => {
              const p = players.find(pl => pl.id === id);
              if (!p) return null;
              const n = NATION_MAP[p.squadId];
              return (
                <span key={id} className="bg-slate-800 text-white text-xs px-2 py-1 rounded-lg">
                  {n?.flag} {p.knownName || p.lastName} ${p.price}M
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      {current && (
        <div className="flex gap-2">
          <button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}
            className="flex-1 bg-slate-800 disabled:opacity-30 text-white py-2 rounded-xl flex items-center justify-center">
            <ChevronLeft size={18} /> Prev
          </button>
          <button onClick={() => setIndex(Math.min(filtered.length - 1, index + 1))}
            className="flex-1 bg-slate-800 text-white py-2 rounded-xl flex items-center justify-center">
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
