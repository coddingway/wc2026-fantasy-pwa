"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useFantasyStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { getTeam } from "@/lib/themes";
import { Trophy, RefreshCw } from "lucide-react";

type Phase = "ready" | "playing" | "result" | "over";
interface BoardRow { phone: string; name: string; team: string; nation: string; best: number; }

const BASE_SPEED = 0.55;   // goal-widths per second
const SPEED_STEP = 0.16;   // added per goal
const KEEPER_W = 1 / 3;    // keeper covers one third

export default function ChallengePage() {
  const { challengeBest, setChallengeBest, favoriteTeam } = useFantasyStore();
  const { phone } = useAuth();

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [keeperL, setKeeperL] = useState(0.33);   // left fraction 0..(1-KEEPER_W)
  const [result, setResult] = useState<"goal" | "save" | null>(null);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const xRef = useRef(0.33);
  const dirRef = useRef(1);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);
  const scoreRef = useRef(0);

  const loadBoard = useCallback(() => {
    if (!phone) return;
    setLoadingBoard(true);
    fetch(`/api/challenge?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json()).then((d) => setBoard(d.board ?? []))
      .catch(() => {}).finally(() => setLoadingBoard(false));
  }, [phone]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const animate = useCallback((t: number) => {
    if (!lastRef.current) lastRef.current = t;
    const dt = (t - lastRef.current) / 1000;
    lastRef.current = t;
    const speed = BASE_SPEED + scoreRef.current * SPEED_STEP;
    let x = xRef.current + dirRef.current * speed * dt;
    const max = 1 - KEEPER_W;
    if (x < 0) { x = 0; dirRef.current = 1; }
    if (x > max) { x = max; dirRef.current = -1; }
    xRef.current = x;
    setKeeperL(x);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const startLoop = useCallback(() => {
    lastRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stopLoop = () => cancelAnimationFrame(rafRef.current);

  useEffect(() => () => stopLoop(), []);

  const start = () => {
    setScore(0); scoreRef.current = 0; setResult(null);
    xRef.current = 0.33; dirRef.current = 1;
    setPhase("playing"); startLoop();
  };

  const shoot = (zone: 0 | 1 | 2) => {
    if (phase !== "playing") return;
    stopLoop();
    const center = xRef.current + KEEPER_W / 2;
    const keeperZone = Math.min(2, Math.floor(center * 3));
    if (keeperZone === zone) {
      setResult("save"); setPhase("result");
      setTimeout(() => endGame(scoreRef.current), 900);
    } else {
      const ns = scoreRef.current + 1;
      scoreRef.current = ns; setScore(ns); setResult("goal"); setPhase("result");
      setTimeout(() => { setResult(null); setPhase("playing"); startLoop(); }, 700);
    }
  };

  const endGame = (final: number) => {
    setPhase("over");
    if (final > challengeBest) { setChallengeBest(final); }
    setTimeout(loadBoard, 1800); // let cloud save land
  };

  const zonePct = (z: number) => `${z * 33.3}%`;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg">Penalty Challenge</p>
          <p className="text-white/80 text-sm">Keeper speeds up every goal. How far can you go?</p>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-2xl">{challengeBest}</p>
          <p className="text-white/70 text-[10px]">Best</p>
        </div>
      </div>

      {/* Pitch / goal */}
      <div className="relative bg-gradient-to-b from-sky-900/40 to-emerald-900/50 rounded-2xl border border-emerald-900/50 overflow-hidden" style={{ height: 320 }}>
        {/* score */}
        <div className="absolute top-3 left-0 right-0 text-center z-10">
          <p className="text-white font-black text-3xl">{score}</p>
          <p className="text-emerald-300 text-[10px]">Speed {(BASE_SPEED + score * SPEED_STEP).toFixed(1)}x</p>
        </div>

        {/* goal frame */}
        <div className="absolute left-[8%] right-[8%] top-16 h-28 border-4 border-white/80 border-b-0 rounded-t-md">
          {/* net */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 14px),repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 14px)" }} />
          {/* keeper */}
          <div className="absolute bottom-0 h-20 rounded bg-yellow-400 transition-none" style={{ left: `${keeperL * 100}%`, width: `${KEEPER_W * 100}%` }}>
            <div className="w-full h-full flex items-center justify-center text-2xl">🧤</div>
          </div>
        </div>

        {/* result flash */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <p className={`font-black text-4xl ${result === "goal" ? "text-emerald-400" : "text-red-400"}`}>
              {result === "goal" ? "GOAL! ⚽" : "SAVED! 🧤"}
            </p>
          </div>
        )}

        {/* ball */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-3xl">⚽</div>
      </div>

      {/* controls */}
      {phase === "ready" && (
        <button onClick={start} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-lg">▶ Start Shooting</button>
      )}
      {(phase === "playing" || phase === "result") && (
        <div className="grid grid-cols-3 gap-2">
          {(["Left", "Center", "Right"] as const).map((lbl, z) => (
            <button key={lbl} onClick={() => shoot(z as 0 | 1 | 2)} disabled={phase !== "playing"}
              className="bg-slate-800 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all active:scale-95">
              {lbl}
            </button>
          ))}
        </div>
      )}
      {phase === "over" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center space-y-2">
          <p className="text-white font-bold">Game over — {score} goal{score !== 1 ? "s" : ""}</p>
          {score >= challengeBest && score > 0 && <p className="text-emerald-400 text-sm">🏆 New personal best!</p>}
          <button onClick={start} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl">Play Again</button>
        </div>
      )}

      {/* leaderboard */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Trophy size={14} className="text-yellow-400" /><p className="text-slate-400 text-xs font-semibold uppercase">League Leaderboard</p></div>
          <button onClick={loadBoard}><RefreshCw size={13} className={`text-slate-500 ${loadingBoard ? "animate-spin" : ""}`} /></button>
        </div>
        {!phone ? (
          <Link href="/login" className="text-emerald-400 text-sm">Login to compete →</Link>
        ) : board.length === 0 ? (
          <p className="text-slate-500 text-sm">Join a league to see rivals here.</p>
        ) : (
          <div className="space-y-1">
            {board.map((r, i) => (
              <div key={r.phone} className={`flex items-center gap-2 p-2 rounded-xl ${r.phone === phone ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800"}`}>
                <span className={`font-black w-5 text-sm ${i === 0 ? "text-yellow-400" : "text-slate-500"}`}>#{i + 1}</span>
                <span>{getTeam(r.nation)?.flag ?? "⚽"}</span>
                <p className="text-white text-sm flex-1 truncate">{r.name || r.team}{r.phone === phone ? " (you)" : ""}</p>
                <span className="text-emerald-400 font-bold">{r.best}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
