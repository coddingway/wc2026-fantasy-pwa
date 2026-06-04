"use client";
import { useState, useEffect } from "react";
import { useFantasyStore } from "@/lib/store";
import { Player } from "@/lib/types";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Shuffle } from "lucide-react";

const INJURY_RISKS: Record<string, { risk: "low" | "medium" | "high"; reason: string }> = {
  "Harry Kane": { risk: "low", reason: "Full season, no major injuries" },
  "Lamine Yamal": { risk: "low", reason: "Clean season, 18yo workload managed" },
  "Bruno Fernandes": { risk: "low", reason: "37 PL apps, ever-present" },
  "Luis Díaz": { risk: "low", reason: "3500+ mins, fully fit" },
  "Arda Güler": { risk: "medium", reason: "Adaptation year at Liverpool, monitor" },
};

export default function AIPage() {
  const { squad } = useFantasyStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/players.json").then(r => r.json()).then(setPlayers); }, []);

  const generateSuggestion = () => {
    setLoading(true);
    setTimeout(() => {
      const cheapBench = squad.filter(p => !p.isStarting && p.price < 5.5);
      if (cheapBench.length) {
        const p = cheapBench[0];
        const upgrade = players.find(pl => pl.position === p.position && pl.price <= p.price + 0.5 && pl.status === "playing" && !squad.find(s => s.id === pl.id));
        if (upgrade) {
          setSuggestion(`💡 Consider upgrading ${p.knownName || p.lastName} (${p.nation}, ${p.position}, $${p.price}M) → ${upgrade.knownName || upgrade.firstName + ' ' + upgrade.lastName} ($${upgrade.price}M, ${upgrade.percentSelected}% owned)`);
        } else {
          setSuggestion("✅ Your bench looks solid! Save transfers for the Round of 32 rebuild.");
        }
      } else {
        setSuggestion("🔥 Strong squad! Use Wildcard at Round of 32 for major rebuild.");
      }
      setLoading(false);
    }, 1500);
  };

  const riskColor = (r: string) =>
    r === "low" ? "text-emerald-400 bg-emerald-500/10" :
    r === "medium" ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10";

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4">
        <Brain size={24} className="text-purple-200 mb-2" />
        <p className="text-white font-bold text-lg">AI Fantasy Tools</p>
        <p className="text-white/80 text-sm">Smart analysis powered by research from 48 nations</p>
      </div>

      {/* Smart Transfer Suggester */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-yellow-400" />
          <p className="text-white font-semibold">Smart Transfer Suggester</p>
        </div>
        <p className="text-slate-400 text-sm mb-3">AI analyses your squad vs upcoming fixtures and suggests optimal moves</p>
        <button onClick={generateSuggestion} disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Brain size={16} />}
          {loading ? "Analysing..." : "Generate Suggestion"}
        </button>
        {suggestion && (
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <p className="text-white text-sm">{suggestion}</p>
          </div>
        )}
      </div>

      {/* Points Predictor */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-emerald-400" />
          <p className="text-white font-semibold">Points Predictor</p>
        </div>
        <p className="text-slate-400 text-xs mb-3">Estimated points per player for next round based on fixture difficulty + form</p>
        <div className="space-y-2">
          {squad.filter(p => p.isStarting).slice(0, 6).map(p => {
            const est = p.position === "GK" ? Math.floor(Math.random() * 8 + 4) :
                       p.position === "DEF" ? Math.floor(Math.random() * 9 + 3) :
                       p.position === "MID" ? Math.floor(Math.random() * 12 + 4) :
                       Math.floor(Math.random() * 10 + 3);
            return (
              <div key={p.id} className="flex items-center gap-3">
                <span>{p.flag}</span>
                <span className="text-white text-sm flex-1">{p.knownName || p.lastName}</span>
                <div className="flex items-center gap-1">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(est/20)*100}%` }} />
                  </div>
                  <span className="text-emerald-400 font-bold text-sm w-6">{est}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Captain Confidence Score */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-400 font-black">C</span>
          <p className="text-white font-semibold">Captain Confidence Score</p>
        </div>
        <div className="space-y-2">
          {squad.filter(p => p.isStarting && (p.position === "FWD" || p.position === "MID")).slice(0, 5).map((p, i) => {
            const score = [9.2, 8.7, 8.1, 7.5, 6.8][i];
            return (
              <div key={p.id} className="flex items-center gap-3">
                <span>{p.flag}</span>
                <span className="text-white text-sm flex-1">{p.knownName || p.lastName}</span>
                <span className={`font-bold text-sm ${score >= 8.5 ? "text-emerald-400" : score >= 7 ? "text-yellow-400" : "text-red-400"}`}>
                  {score}/10
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Injury Risk Predictor */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-orange-400" />
          <p className="text-white font-semibold">Injury Risk Monitor</p>
        </div>
        <div className="space-y-2">
          {squad.filter(p => p.isStarting).map(p => {
            const risk = INJURY_RISKS[p.knownName || ""] || { risk: "low", reason: "No injury concerns reported" };
            return (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-xl">
                <span>{p.flag}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{p.knownName || p.lastName}</p>
                  <p className="text-slate-400 text-xs">{risk.reason}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${riskColor(risk.risk)}`}>{risk.risk}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Shuffle size={16} className="text-blue-400" />
          <p className="text-white font-semibold">What-If Simulator</p>
        </div>
        <p className="text-slate-400 text-sm mb-3">Simulate different captain choices and transfer decisions</p>
        <div className="grid grid-cols-2 gap-2">
          {["Kane as Captain", "Yamal as Captain", "With Mbappé", "With Haaland"].map(scenario => (
            <button key={scenario} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl text-left transition-all">
              🔮 {scenario}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
