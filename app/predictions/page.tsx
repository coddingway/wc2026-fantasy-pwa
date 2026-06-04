"use client";
import { useState } from "react";
import { useFantasyStore } from "@/lib/store";
import { Target, CheckCircle, X } from "lucide-react";

const FIXTURES = [
  { id: "1", home: "🇲🇽 Mexico", away: "🇿🇦 S.Africa", date: "Jun 11", group: "A" },
  { id: "2", home: "🇧🇷 Brazil", away: "🇲🇦 Morocco", date: "Jun 13", group: "C" },
  { id: "3", home: "🇩🇪 Germany", away: "🇨🇼 Curaçao", date: "Jun 14", group: "E" },
  { id: "4", home: "🇳🇱 Netherlands", away: "🇯🇵 Japan", date: "Jun 14", group: "F" },
  { id: "5", home: "🇪🇸 Spain", away: "🇨🇻 Cape Verde", date: "Jun 15", group: "H" },
  { id: "6", home: "🇫🇷 France", away: "🇸🇳 Senegal", date: "Jun 16", group: "I" },
  { id: "7", home: "🇦🇷 Argentina", away: "🇩🇿 Algeria", date: "Jun 16", group: "J" },
  { id: "8", home: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", away: "🇭🇷 Croatia", date: "Jun 17", group: "L" },
];

export default function PredictionsPage() {
  const { addPrediction, predictions } = useFantasyStore();
  const [preds, setPreds] = useState<Record<string, { home: number; away: number }>>({});
  const [submitted, setSubmitted] = useState<string[]>([]);

  const updateScore = (id: string, side: "home" | "away", val: number) => {
    setPreds(prev => ({ ...prev, [id]: { ...prev[id], [side]: val, [side === "home" ? "away" : "home"]: prev[id]?.[side === "home" ? "away" : "home"] ?? 0 } }));
  };

  const submit = (fixture: typeof FIXTURES[0]) => {
    const p = preds[fixture.id];
    if (p === undefined || p.home === undefined || p.away === undefined) return;
    addPrediction({ matchId: fixture.id, homeScore: p.home, awayScore: p.away, firstScorer: "" });
    setSubmitted(prev => [...prev, fixture.id]);
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl p-4">
        <Target size={24} className="text-pink-200 mb-2" />
        <p className="text-white font-bold text-lg">Prediction Game</p>
        <p className="text-white/80 text-sm">Predict scores for bonus points + bragging rights</p>
      </div>

      <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
        <p className="text-slate-400 text-xs">Correct result = <span className="text-emerald-400 font-bold">+2 pts</span> · Correct score = <span className="text-yellow-400 font-bold">+5 pts</span> · Streak bonus = <span className="text-purple-400 font-bold">+3 pts</span></p>
      </div>

      <div className="space-y-3">
        {FIXTURES.map(f => {
          const p = preds[f.id];
          const done = submitted.includes(f.id);
          return (
            <div key={f.id} className={`bg-slate-900 rounded-2xl p-4 border ${done ? "border-emerald-500/30" : "border-slate-800"}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-xs">Group {f.group}</span>
                <span className="text-slate-400 text-xs">{f.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm flex-1 text-right">{f.home}</span>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={20} value={p?.home ?? ""} onChange={e => updateScore(f.id, "home", Number(e.target.value))}
                    disabled={done} placeholder="0"
                    className="w-10 h-10 bg-slate-800 text-white text-center font-bold rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                  <span className="text-slate-400 font-bold">-</span>
                  <input type="number" min={0} max={20} value={p?.away ?? ""} onChange={e => updateScore(f.id, "away", Number(e.target.value))}
                    disabled={done} placeholder="0"
                    className="w-10 h-10 bg-slate-800 text-white text-center font-bold rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                </div>
                <span className="text-sm flex-1">{f.away}</span>
              </div>
              <div className="mt-3">
                {done ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle size={14} />
                    <span>Predicted: {preds[f.id]?.home} - {preds[f.id]?.away}</span>
                  </div>
                ) : (
                  <button onClick={() => submit(f)} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-xl text-sm transition-all">
                    Lock Prediction
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {predictions.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Your Predictions ({predictions.length})</p>
          <p className="text-slate-400 text-sm">Results will appear after matches complete</p>
        </div>
      )}
    </div>
  );
}
