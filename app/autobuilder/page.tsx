"use client";
import { useState, useEffect } from "react";
import { Player } from "@/lib/types";
import { useFantasyStore } from "@/lib/store";
import { Wand2, RefreshCw, CheckCircle, Sliders } from "lucide-react";

const NATION_MAP: Record<number, string> = {
  1:"ALG",2:"ARG",3:"AUS",4:"AUT",5:"BEL",6:"BIH",7:"BRA",9:"CAN",10:"URU",
  11:"CIV",12:"CIV",13:"CRO",14:"CUW",15:"CZE",16:"ECU",17:"EGY",18:"ENG",
  19:"FRA",20:"GER",21:"GHA",22:"HAI",23:"IRN",24:"IRQ",25:"JPN",26:"JOR",
  27:"KOR",28:"MEX",29:"MAR",30:"NED",31:"NZL",32:"NOR",33:"PAN",34:"URU",
  35:"POR",36:"QAT",37:"KSA",38:"SCO",39:"SEN",40:"RSA",41:"ESP",42:"SWE",
  43:"SUI",44:"TUN",45:"TUR",46:"URU",47:"USA",48:"UZB",
};

const FLAG_MAP: Record<string, string> = {
  BEL:"🇧🇪",ARG:"🇦🇷",GER:"🇩🇪",NED:"🇳🇱",FRA:"🇫🇷",BRA:"🇧🇷",MAR:"🇲🇦",
  ESP:"🇪🇸",POR:"🇵🇹",COL:"🇨🇴",TUR:"🇹🇷",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",MEX:"🇲🇽",JPN:"🇯🇵",CRO:"🇭🇷",
  USA:"🇺🇸",SEN:"🇸🇳",URU:"🇺🇾",SUI:"🇨🇭",NOR:"🇳🇴",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

// Nations going deep in tournament (easy/strong groups)
const PRIORITY_NATIONS = new Set(["ENG","ARG","ESP","FRA","GER","BRA","POR","BEL","NED","TUR","COL","USA","JPN","CRO","MAR"]);

interface BuildSettings {
  budget: number;
  prioritizeNations: boolean;
  maxPerNation: number;
  formation: "4-4-2" | "4-3-3" | "3-5-2";
  strategy: "balanced" | "attack" | "defence";
}

function buildOptimalSquad(players: Player[], settings: BuildSettings) {
  const { budget, prioritizeNations, maxPerNation, formation, strategy } = settings;

  const [defCount, midCount, fwdCount] = formation === "4-4-2" ? [4,4,2] :
    formation === "4-3-3" ? [4,3,3] : [3,5,2];

  const active = players.filter(p => p.status === "playing");
  const nationCount: Record<string, number> = {};

  // Score each player by value
  const scored = active.map(p => {
    const nation = NATION_MAP[p.squadId] || "UNK";
    const priorityBonus = prioritizeNations && PRIORITY_NATIONS.has(nation) ? 2 : 0;
    const posBonus = strategy === "attack" && (p.position === "FWD" || p.position === "MID") ? 1.5 :
                     strategy === "defence" && (p.position === "DEF" || p.position === "GK") ? 1.5 : 0;
    const score = (p.percentSelected * 0.3) + (p.price * 0.7) + priorityBonus + posBonus;
    return { ...p, nation, flag: FLAG_MAP[nation] || "🏳️", score };
  }).sort((a, b) => b.score - a.score);

  const pick = (pos: string, count: number, remaining: { budget: number }) => {
    const result = [];
    for (const p of scored) {
      if (result.length >= count) break;
      if (p.position !== pos) continue;
      const nat = p.nation;
      if ((nationCount[nat] || 0) >= maxPerNation) continue;
      if (p.price > remaining.budget - 3.5 * (count - result.length - 1)) continue;
      result.push(p);
      remaining.budget -= p.price;
      nationCount[nat] = (nationCount[nat] || 0) + 1;
    }
    return result;
  };

  const rem = { budget: budget - 3.5 * 4 }; // reserve bench budget
  const gks = pick("GK", 1, rem);
  const defs = pick("DEF", defCount, rem);
  const mids = pick("MID", midCount, rem);
  const fwds = pick("FWD", fwdCount, rem);
  const rem2 = { budget: rem.budget };
  const benchGk = pick("GK", 1, rem2);
  const benchDef = pick("DEF", 1, rem2);
  const benchMid = pick("MID", 1, rem2);
  const benchFwd = pick("FWD", 1, rem2);

  const starters = [...gks, ...defs, ...mids, ...fwds];
  const bench = [...benchGk, ...benchDef, ...benchMid, ...benchFwd];
  const total = [...starters, ...bench].reduce((s, p) => s + p.price, 0);
  const nations = new Set([...starters, ...bench].map(p => p.nation)).size;

  return { starters, bench, total, nations };
}

export default function AutoBuilderPage() {
  const { setSquad, squad } = useFantasyStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<BuildSettings>({
    budget: 100, prioritizeNations: true, maxPerNation: 3,
    formation: "4-4-2", strategy: "balanced",
  });
  const [result, setResult] = useState<ReturnType<typeof buildOptimalSquad> | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => { fetch("/players.json").then(r => r.json()).then(setPlayers); }, []);

  const build = () => {
    if (!players.length) return;
    setApplied(false);
    setResult(buildOptimalSquad(players, settings));
  };

  const applyToSquad = () => {
    if (!result) return;
    const all = [...result.starters, ...result.bench];
    const mapped = all.map((p, i) => ({
      ...p,
      isStarting: i < result.starters.length,
      isCaptain: i === 0,
      isViceCaptain: i === result.starters.length - 1,
    }));
    setSquad(mapped as any);
    setApplied(true);
  };

  const posColor = (pos: string) =>
    pos === "GK" ? "text-yellow-400" : pos === "DEF" ? "text-blue-400" :
    pos === "MID" ? "text-emerald-400" : "text-red-400";

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-4">
        <Wand2 size={24} className="text-violet-200 mb-2" />
        <p className="text-white font-bold text-lg">Auto-Squad Builder</p>
        <p className="text-white/80 text-sm">AI builds the optimal 15-player squad from all 1,481 players</p>
      </div>

      {/* Settings */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sliders size={14} className="text-purple-400" />
          <p className="text-white font-semibold">Build Settings</p>
        </div>

        {/* Budget */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-slate-400 text-xs">Budget</p>
            <p className="text-emerald-400 font-bold text-xs">${settings.budget}M</p>
          </div>
          <input type="range" min={80} max={100} step={0.5} value={settings.budget}
            onChange={e => setSettings(s => ({ ...s, budget: Number(e.target.value) }))}
            className="w-full accent-purple-500" />
        </div>

        {/* Max Per Nation */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-slate-400 text-xs">Max Players Per Nation</p>
            <p className="text-purple-400 font-bold text-xs">{settings.maxPerNation}</p>
          </div>
          <input type="range" min={1} max={3} step={1} value={settings.maxPerNation}
            onChange={e => setSettings(s => ({ ...s, maxPerNation: Number(e.target.value) }))}
            className="w-full accent-purple-500" />
        </div>

        {/* Formation */}
        <div>
          <p className="text-slate-400 text-xs mb-2">Formation</p>
          <div className="flex gap-2">
            {(["4-4-2","4-3-3","3-5-2"] as const).map(f => (
              <button key={f} onClick={() => setSettings(s => ({ ...s, formation: f }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${settings.formation === f ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div>
          <p className="text-slate-400 text-xs mb-2">Strategy</p>
          <div className="flex gap-2">
            {(["balanced","attack","defence"] as const).map(s => (
              <button key={s} onClick={() => setSettings(prev => ({ ...prev, strategy: s }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${settings.strategy === s ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Priority Nations Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm">Prioritize Deep-Running Nations</p>
            <p className="text-slate-400 text-xs">Prefer ENG, ARG, ESP, FRA, GER etc.</p>
          </div>
          <button onClick={() => setSettings(s => ({ ...s, prioritizeNations: !s.prioritizeNations }))}
            className={`w-12 h-6 rounded-full transition-all ${settings.prioritizeNations ? "bg-purple-500" : "bg-slate-700"}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mx-0.5 ${settings.prioritizeNations ? "translate-x-6" : ""}`} />
          </button>
        </div>
      </div>

      {/* Build Button */}
      <button onClick={build} disabled={!players.length}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 active:scale-95">
        <Wand2 size={20} />
        {players.length ? "Build Optimal Squad" : "Loading players..."}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-purple-500/30">
            <p className="text-purple-400 font-bold text-sm mb-3">✨ Optimal Squad Generated</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center bg-slate-800 rounded-xl p-2">
                <p className="text-emerald-400 font-black">${result.total.toFixed(1)}M</p>
                <p className="text-slate-400 text-xs">Total Cost</p>
              </div>
              <div className="text-center bg-slate-800 rounded-xl p-2">
                <p className="text-blue-400 font-black">{result.nations}</p>
                <p className="text-slate-400 text-xs">Nations</p>
              </div>
              <div className="text-center bg-slate-800 rounded-xl p-2">
                <p className="text-yellow-400 font-black">${(settings.budget - result.total).toFixed(1)}M</p>
                <p className="text-slate-400 text-xs">Remaining</p>
              </div>
            </div>

            {/* Starters */}
            <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Starting XI</p>
            <div className="space-y-1">
              {result.starters.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 p-1.5 bg-slate-800 rounded-lg">
                  <span className="text-base">{p.flag}</span>
                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${posColor(p.position)} bg-slate-700`}>{p.position}</span>
                  <span className="text-white text-xs flex-1 truncate">{p.knownName || `${p.firstName} ${p.lastName}`}</span>
                  {i === 0 && <span className="text-yellow-400 text-[10px] font-black">©C</span>}
                  <span className="text-emerald-400 text-xs font-bold">${p.price}M</span>
                </div>
              ))}
            </div>

            {/* Bench */}
            <p className="text-slate-400 text-xs font-semibold uppercase mt-3 mb-2">Bench</p>
            <div className="space-y-1">
              {result.bench.map(p => (
                <div key={p.id} className="flex items-center gap-2 p-1.5 bg-slate-700/50 rounded-lg opacity-70">
                  <span className="text-base">{p.flag}</span>
                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${posColor(p.position)} bg-slate-700`}>{p.position}</span>
                  <span className="text-slate-300 text-xs flex-1 truncate">{p.knownName || `${p.firstName} ${p.lastName}`}</span>
                  <span className="text-slate-400 text-xs">${p.price}M</span>
                </div>
              ))}
            </div>

            {/* Apply Button */}
            <button onClick={applyToSquad} disabled={applied}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${applied ? "bg-emerald-600/30 text-emerald-400" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
              {applied ? <><CheckCircle size={16} />Applied to Squad!</> : "Apply to My Squad"}
            </button>
          </div>

          {/* Rebuild */}
          <button onClick={build} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-semibold text-sm transition-all">
            <RefreshCw size={14} /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
