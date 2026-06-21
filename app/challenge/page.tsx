"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useFantasyStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { getTeam } from "@/lib/themes";
import { Trophy, RefreshCw } from "lucide-react";

type Phase = "ready" | "aiming" | "shooting" | "over";
interface BoardRow { phone: string; name: string; team: string; nation: string; best: number; }

const KW = 0.26;              // keeper width (fraction of goal)
const SWEEP = 95;             // needle sweep deg/sec
const KEEP_BASE = 0.5;        // keeper speed (goal-widths/sec)
const KEEP_STEP = 0.18;       // + per goal

export default function ChallengePage() {
  const { challengeBest, setChallengeBest, favoriteTeam } = useFantasyStore();
  const { phone } = useAuth();

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [angle, setAngle] = useState(0);          // needle deg -90..90
  const [keeperX, setKeeperX] = useState(0.37);   // left fraction
  const [keeperDive, setKeeperDive] = useState<number | null>(null);
  const [ball, setBall] = useState<{ x: number; up: boolean }>({ x: 0.5, up: false });
  const [result, setResult] = useState<"goal" | "save" | null>(null);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const aRef = useRef(0), aDir = useRef(1);
  const kRef = useRef(0.37), kDir = useRef(1);
  const rafRef = useRef(0), lastRef = useRef(0), scoreRef = useRef(0);

  const loadBoard = useCallback(() => {
    if (!phone) return;
    setLoadingBoard(true);
    fetch(`/api/challenge?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json()).then((d) => setBoard(d.board ?? []))
      .catch(() => {}).finally(() => setLoadingBoard(false));
  }, [phone]);
  useEffect(() => { loadBoard(); }, [loadBoard]);

  const loop = useCallback((t: number) => {
    if (!lastRef.current) lastRef.current = t;
    const dt = (t - lastRef.current) / 1000; lastRef.current = t;
    // needle sweep -90..90
    let a = aRef.current + aDir.current * SWEEP * dt;
    if (a > 90) { a = 90; aDir.current = -1; }
    if (a < -90) { a = -90; aDir.current = 1; }
    aRef.current = a; setAngle(a);
    // keeper slide
    const ks = KEEP_BASE + scoreRef.current * KEEP_STEP;
    let k = kRef.current + kDir.current * ks * dt;
    const max = 1 - KW;
    if (k < 0) { k = 0; kDir.current = 1; }
    if (k > max) { k = max; kDir.current = -1; }
    kRef.current = k; setKeeperX(k);
    rafRef.current = requestAnimationFrame(loop);
  }, []);
  const startLoop = useCallback(() => { lastRef.current = 0; rafRef.current = requestAnimationFrame(loop); }, [loop]);
  const stopLoop = () => cancelAnimationFrame(rafRef.current);
  useEffect(() => () => stopLoop(), []);

  const begin = () => {
    setScore(0); scoreRef.current = 0; setResult(null); setKeeperDive(null);
    setBall({ x: 0.5, up: false });
    aRef.current = 0; aDir.current = 1; kRef.current = 0.37; kDir.current = 1;
    setPhase("aiming"); startLoop();
  };

  const shoot = () => {
    if (phase !== "aiming") return;
    stopLoop();
    const target = (aRef.current + 90) / 180;        // 0..1 across goal
    const keeperCenter = kRef.current + KW / 2;
    const saved = Math.abs(target - keeperCenter) < KW / 2 + 0.03;
    setPhase("shooting");
    setBall({ x: target, up: true });                // ball flies (CSS transition)
    setKeeperDive(target);                            // keeper lunges toward ball

    setTimeout(() => {
      if (saved) {
        setResult("save");
        setTimeout(() => endGame(scoreRef.current), 1100);
      } else {
        const ns = scoreRef.current + 1; scoreRef.current = ns; setScore(ns);
        setResult("goal");
        setTimeout(() => {
          setResult(null); setKeeperDive(null); setBall({ x: 0.5, up: false });
          setPhase("aiming"); startLoop();
        }, 900);
      }
    }, 650);
  };

  const endGame = (final: number) => {
    setPhase("over");
    if (final > challengeBest) setChallengeBest(final);
    setTimeout(loadBoard, 1800);
  };

  // goal inner area: left 8%..92% (width 84%)
  const gx = (f: number) => `calc(8% + ${f * 84}% )`;
  const speed = (KEEP_BASE + score * KEEP_STEP).toFixed(1);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg">Penalty Challenge</p>
          <p className="text-white/80 text-sm">Aim with the swinging arrow. Tap to shoot.</p>
        </div>
        <div className="text-center"><p className="text-white font-black text-2xl">{challengeBest}</p><p className="text-white/70 text-[10px]">Best</p></div>
      </div>

      {/* Stadium */}
      <div className="relative bg-gradient-to-b from-sky-800/50 to-emerald-800/60 rounded-2xl border border-emerald-900/50 overflow-hidden" style={{ height: 380 }}>
        <div className="absolute top-2 left-0 right-0 text-center z-20">
          <p className="text-white font-black text-3xl drop-shadow">{score}</p>
          <p className="text-emerald-200 text-[10px]">keeper speed {speed}x</p>
        </div>

        {/* goal frame */}
        <div className="absolute left-[8%] right-[8%] top-14 h-32 border-4 border-white border-b-0 rounded-t">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 16px),repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 16px)" }} />
        </div>

        {/* keeper character */}
        <div className="absolute" style={{
          top: 84,
          left: gx(keeperDive != null ? Math.min(1 - KW, Math.max(0, keeperDive - KW / 2)) : keeperX),
          width: `${KW * 84}%`,
          transition: phase === "shooting" ? "left 0.45s cubic-bezier(.2,.8,.3,1), transform 0.45s" : "none",
          transform: keeperDive != null ? "scale(1.05)" : "none",
          zIndex: 10,
        }}>
          <div className="text-center text-5xl leading-none select-none">🧤</div>
          <div className="text-center text-3xl leading-none -mt-2 select-none">🧍‍♂️</div>
        </div>

        {/* ball */}
        <div className="absolute" style={{
          left: gx(ball.x), bottom: ball.up ? "62%" : "10%",
          transform: `translateX(-50%) scale(${ball.up ? 0.55 : 1})`,
          transition: "left 0.6s cubic-bezier(.3,.6,.4,1), bottom 0.6s cubic-bezier(.3,.6,.4,1), transform 0.6s",
          zIndex: 15,
        }}>
          <span className="text-3xl select-none">⚽</span>
        </div>

        {/* aim needle (180 sweep) */}
        {phase === "aiming" && (
          <div className="absolute left-1/2 bottom-8 z-20" style={{ height: 110, transformOrigin: "bottom center", transform: `translateX(-50%) rotate(${angle}deg)` }}>
            <div className="w-1 bg-yellow-400 rounded-full" style={{ height: 110 }} />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 text-lg">▲</div>
          </div>
        )}

        {/* result flash */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <p className={`font-black text-4xl drop-shadow ${result === "goal" ? "text-emerald-300" : "text-red-400"}`}>
              {result === "goal" ? "GOAL! ⚽" : "SAVED! 🧤"}
            </p>
          </div>
        )}
      </div>

      {/* controls */}
      {phase === "ready" && <button onClick={begin} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-lg">▶ Start</button>}
      {phase === "aiming" && <button onClick={shoot} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl text-xl active:scale-95">⚽ SHOOT</button>}
      {phase === "shooting" && <button disabled className="w-full bg-slate-800 text-slate-500 font-black py-5 rounded-2xl text-xl">...</button>}
      {phase === "over" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center space-y-2">
          <p className="text-white font-bold">Game over — {score} goal{score !== 1 ? "s" : ""}</p>
          {score >= challengeBest && score > 0 && <p className="text-emerald-400 text-sm">🏆 New personal best!</p>}
          <button onClick={begin} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl">Play Again</button>
        </div>
      )}

      {/* leaderboard */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Trophy size={14} className="text-yellow-400" /><p className="text-slate-400 text-xs font-semibold uppercase">League Leaderboard</p></div>
          <button onClick={loadBoard}><RefreshCw size={13} className={`text-slate-500 ${loadingBoard ? "animate-spin" : ""}`} /></button>
        </div>
        {!phone ? <Link href="/login" className="text-emerald-400 text-sm">Login to compete →</Link>
        : board.length === 0 ? <p className="text-slate-500 text-sm">Join a league to see rivals here.</p>
        : <div className="space-y-1">
            {board.map((r, i) => (
              <div key={r.phone} className={`flex items-center gap-2 p-2 rounded-xl ${r.phone === phone ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800"}`}>
                <span className={`font-black w-5 text-sm ${i === 0 ? "text-yellow-400" : "text-slate-500"}`}>#{i + 1}</span>
                <span>{getTeam(r.nation)?.flag ?? "⚽"}</span>
                <p className="text-white text-sm flex-1 truncate">{r.name || r.team}{r.phone === phone ? " (you)" : ""}</p>
                <span className="text-emerald-400 font-bold">{r.best}</span>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
