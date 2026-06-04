"use client";
import { useEffect, useRef } from "react";

const FIXTURES = [
  { home: "🇲🇽 MEX", away: "🇿🇦 RSA", date: "Jun 11", group: "A", diff: "easy" },
  { home: "🇭🇷 CRO", away: "🇩🇿 ALG", date: "Jun 12", group: "B", diff: "easy" },
  { home: "🇳🇱 NED", away: "🇯🇵 JPN", date: "Jun 14", group: "F", diff: "medium" },
  { home: "🇩🇪 GER", away: "🇨🇼 CUW", date: "Jun 14", group: "E", diff: "easy" },
  { home: "🇪🇸 ESP", away: "🇨🇻 CPV", date: "Jun 15", group: "H", diff: "easy" },
  { home: "🇫🇷 FRA", away: "🇸🇳 SEN", date: "Jun 16", group: "I", diff: "medium" },
  { home: "🇦🇷 ARG", away: "🇩🇿 ALG", date: "Jun 16", group: "J", diff: "easy" },
  { home: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG", away: "🇭🇷 CRO", date: "Jun 17", group: "L", diff: "medium" },
  { home: "🇵🇹 POR", away: "🇨🇩 DRC", date: "Jun 17", group: "K", diff: "easy" },
  { home: "🇧🇷 BRA", away: "🇲🇦 MAR", date: "Jun 13", group: "C", diff: "medium" },
  { home: "🇧🇪 BEL", away: "🇮🇷 IRN", date: "Jun 14", group: "G", diff: "easy" },
  { home: "🇺🇸 USA", away: "🇵🇾 PAR", date: "Jun 12", group: "D", diff: "easy" },
];

const diffColor = (d: string) =>
  d === "easy" ? "text-emerald-400" : d === "medium" ? "text-yellow-400" : "text-red-400";

export default function FixtureTicker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  const items = [...FIXTURES, ...FIXTURES];

  return (
    <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-xl py-2">
      <div ref={ref} className="flex gap-6 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((f, i) => (
          <div key={i} className="flex items-center gap-2 px-3">
            <span className="text-white text-xs">{f.home}</span>
            <span className="text-slate-500 text-xs">vs</span>
            <span className="text-white text-xs">{f.away}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${diffColor(f.diff)} bg-current/10`}>{f.date}</span>
            <span className="text-slate-600 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
