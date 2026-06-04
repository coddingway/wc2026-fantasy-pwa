"use client";
import { useFantasyStore } from "@/lib/store";
import { Crown, Star, TrendingUp, Target } from "lucide-react";

const FIXTURE_DIFFICULTY: Record<string, { opp: string; diff: "easy" | "medium" | "hard"; score: number }> = {
  ENG: { opp: "vs Croatia", diff: "medium", score: 7 },
  ARG: { opp: "vs Algeria", diff: "easy", score: 9 },
  ESP: { opp: "vs Cape Verde", diff: "easy", score: 9 },
  FRA: { opp: "vs Senegal", diff: "medium", score: 7 },
  GER: { opp: "vs Curaçao", diff: "easy", score: 10 },
  BRA: { opp: "vs Morocco", diff: "medium", score: 7 },
  POR: { opp: "vs DR Congo", diff: "easy", score: 9 },
  COL: { opp: "vs DR Congo", diff: "easy", score: 8 },
  TUR: { opp: "vs Australia", diff: "easy", score: 7 },
  NED: { opp: "vs Tunisia", diff: "easy", score: 8 },
  BEL: { opp: "vs Iran", diff: "easy", score: 10 },
  MAR: { opp: "vs Haiti", diff: "easy", score: 9 },
  MEX: { opp: "vs S.Africa", diff: "easy", score: 8 },
  JPN: { opp: "vs Tunisia", diff: "medium", score: 6 },
  CRO: { opp: "vs England", diff: "hard", score: 4 },
};

const SET_PIECE_TAKERS: Record<string, string> = {
  "Harry Kane": "Pens + FKs for England",
  "Bruno Fernandes": "FKs + Corners for Portugal",
  "Lamine Yamal": "FKs for Spain",
  "Julián Álvarez": "Pen backup for Argentina",
};

export default function CaptainPage() {
  const { squad, setCaptain, setViceCaptain } = useFantasyStore();
  const starters = squad.filter(p => p.isStarting);

  const ranked = starters
    .map(p => ({
      ...p,
      fixture: FIXTURE_DIFFICULTY[p.nation] || { opp: "TBD", diff: "medium" as const, score: 5 },
      setpiece: SET_PIECE_TAKERS[p.knownName || ""] || null,
      captainScore: (FIXTURE_DIFFICULTY[p.nation]?.score || 5) +
        (p.position === "FWD" ? 2 : p.position === "MID" ? 1.5 : 0) +
        (SET_PIECE_TAKERS[p.knownName || ""] ? 1.5 : 0),
    }))
    .sort((a, b) => b.captainScore - a.captainScore);

  const diffColor = (d: string) =>
    d === "easy" ? "text-emerald-400 bg-emerald-500/10" :
    d === "medium" ? "text-yellow-400 bg-yellow-500/10" :
    "text-red-400 bg-red-500/10";

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-4">
        <Crown size={24} className="text-yellow-200 mb-2" />
        <p className="text-white font-bold text-lg">Captain Picker</p>
        <p className="text-white/80 text-sm">AI-ranked by fixture difficulty + form + set pieces</p>
      </div>

      {/* Top Pick Highlight */}
      <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-4">
        <p className="text-yellow-400 text-xs font-semibold uppercase mb-2">🌟 Grove Street Recommends</p>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{ranked[0]?.flag}</div>
          <div>
            <p className="text-white font-bold text-lg">{ranked[0]?.knownName || ranked[0]?.lastName}</p>
            <p className="text-slate-400 text-sm">{ranked[0]?.fixture.opp} · {ranked[0]?.position}</p>
            {ranked[0]?.setpiece && <p className="text-emerald-400 text-xs">{ranked[0].setpiece}</p>}
          </div>
          <div className="ml-auto text-center">
            <p className="text-yellow-400 font-black text-2xl">{ranked[0]?.captainScore.toFixed(1)}</p>
            <p className="text-slate-400 text-xs">Score</p>
          </div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Captain Confidence Rankings</p>
        <div className="space-y-2">
          {ranked.map((p, i) => (
            <div key={p.id} className="bg-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold w-5">{i+1}</span>
                <span className="text-xl">{p.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{p.knownName || p.lastName}</p>
                    {p.isCaptain && <Crown size={12} className="text-yellow-400" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${diffColor(p.fixture.diff)}`}>
                      {p.fixture.opp}
                    </span>
                    {p.setpiece && <span className="text-emerald-400 text-[10px]">Set pieces ✓</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-yellow-400 font-bold">{p.captainScore.toFixed(1)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCaptain(p.id)}
                      className="bg-yellow-500/20 text-yellow-400 text-[9px] px-2 py-0.5 rounded font-bold">Cap</button>
                    <button onClick={() => setViceCaptain(p.id)}
                      className="bg-slate-700 text-slate-300 text-[9px] px-2 py-0.5 rounded font-bold">VC</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Captain Rules */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Captain Rules</p>
        {[
          { icon: "2x", text: "Captain scores DOUBLE points every round" },
          { icon: "⚠️", text: "If captain DNP, VC doubles — only if no manual changes made" },
          { icon: "🔄", text: "Can change captain unlimited times during live round" },
          { icon: "✅", text: "New captain must not have played yet in current round" },
        ].map((r, i) => (
          <div key={i} className="flex gap-3 mb-2">
            <span className="text-emerald-400 font-bold text-sm w-6">{r.icon}</span>
            <p className="text-slate-300 text-sm">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
