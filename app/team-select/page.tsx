"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFantasyStore } from "@/lib/store";
import { TEAMS, buildAccentScale, getTeam } from "@/lib/themes";
import { Search, Check } from "lucide-react";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function TeamSelectPage() {
  const { favoriteTeam, setFavoriteTeam } = useFantasyStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string | null>(favoriteTeam);

  const current = getTeam(picked);
  const filtered = TEAMS.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const confirm = () => {
    if (!picked) return;
    setFavoriteTeam(picked); // ThemeProvider re-themes + CloudSync saves
    router.push("/");
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="text-center">
        <p className="text-4xl mb-2">{current ? current.flag : "🌍"}</p>
        <p className="text-white font-black text-xl">Pick Your Nation</p>
        <p className="text-slate-400 text-sm">
          The whole app wears your team's colors. Choose wisely, homie.
        </p>
      </div>

      {/* Live preview of the picked team's accent */}
      {current && (
        <div className="rounded-2xl p-4 border border-slate-700 overflow-hidden relative"
          style={{ background: `linear-gradient(135deg, ${buildAccentScale(current.accent)[600]}, ${buildAccentScale(current.accent)[900]})` }}>
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${current.flagColors.join(",")})` }} />
          <p className="text-white font-bold text-lg mt-1">{current.flag} {current.name}</p>
          <p className="text-white/70 text-xs">Group {current.group} · This is your new look</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search nations..."
          className="w-full bg-slate-900 border border-slate-700 text-white text-sm pl-8 pr-3 py-3 rounded-xl focus:outline-none focus:border-emerald-500" />
      </div>

      {/* Teams by group */}
      <div className="space-y-4">
        {GROUPS.map((g) => {
          const teams = filtered.filter((t) => t.group === g);
          if (!teams.length) return null;
          return (
            <div key={g}>
              <p className="text-slate-500 text-xs font-semibold uppercase mb-2">Group {g}</p>
              <div className="grid grid-cols-2 gap-2">
                {teams.map((t) => {
                  const isPicked = picked === t.code;
                  return (
                    <button key={t.code} onClick={() => setPicked(t.code)}
                      className={`relative flex items-center gap-2 p-3 rounded-xl border text-left transition-all active:scale-95 ${
                        isPicked ? "border-white/60 bg-slate-800" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
                      <span className="absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-80"
                        style={{ background: `linear-gradient(90deg, ${t.flagColors.join(",")})` }} />
                      <span className="text-2xl">{t.flag}</span>
                      <span className="text-white text-sm font-medium flex-1 truncate">{t.name}</span>
                      {isPicked && <Check size={16} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm — sticky above bottom nav */}
      <div className="sticky bottom-24 pt-2">
        <button onClick={confirm} disabled={!picked}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black py-4 rounded-2xl text-lg transition-all shadow-xl">
          {current ? `Rep ${current.name} ${current.flag}` : "Select a nation first"}
        </button>
      </div>
    </div>
  );
}
