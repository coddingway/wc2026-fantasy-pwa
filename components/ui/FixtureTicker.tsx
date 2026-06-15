"use client";
import { useEffect, useRef, useState } from "react";
import { getTeam } from "@/lib/themes";
import type { ApiMatch } from "@/app/api/fixtures/route";

interface TickerItem {
  homeFlag: string; homeTla: string;
  awayFlag: string; awayTla: string;
  label: string; live: boolean;
}

const sameDay = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export default function FixtureTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => {
        const matches: ApiMatch[] = d.matches ?? [];
        const upcoming = matches
          .filter((m) => m.status !== "FINISHED") // today + future only, no done matches
          .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
          .slice(0, 20)
          .map((m): TickerItem => {
            const live = m.status === "IN_PLAY" || m.status === "PAUSED";
            const label = live
              ? (m.minute != null ? `${m.minute}'` : "LIVE")
              : sameDay(m.utcDate)
                ? `Today ${new Date(m.utcDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : new Date(m.utcDate).toLocaleDateString([], { month: "short", day: "numeric" });
            return {
              homeFlag: getTeam(m.home.tla)?.flag ?? "⚽", homeTla: m.home.tla || m.home.name.slice(0, 3).toUpperCase(),
              awayFlag: getTeam(m.away.tla)?.flag ?? "⚽", awayTla: m.away.tla || m.away.name.slice(0, 3).toUpperCase(),
              label, live,
            };
          });
        setItems(upcoming);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || items.length === 0) return;
    let frame: number;
    let pos = 0;
    const speed = 0.5;
    const animate = () => {
      pos -= speed;
      if (el.firstChild && pos <= -(el.scrollWidth / 2)) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-4">
        <p className="text-slate-500 text-xs text-center">No upcoming matches scheduled</p>
      </div>
    );
  }

  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-xl py-2">
      <div ref={ref} className="flex gap-6 whitespace-nowrap" style={{ width: "max-content" }}>
        {loop.map((f, i) => (
          <div key={i} className="flex items-center gap-2 px-3">
            <span className="text-white text-xs">{f.homeFlag} {f.homeTla}</span>
            <span className="text-slate-500 text-xs">vs</span>
            <span className="text-white text-xs">{f.awayFlag} {f.awayTla}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${f.live ? "text-red-400 bg-red-500/10 animate-pulse" : "text-emerald-400 bg-emerald-500/10"}`}>
              {f.label}
            </span>
            <span className="text-slate-600 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
