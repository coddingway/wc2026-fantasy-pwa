"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ApiMatch } from "@/app/api/fixtures/route";

export default function AllResultsPage() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());

  // group by calendar day
  const groups: Record<string, ApiMatch[]> = {};
  for (const m of finished) {
    const day = new Date(m.utcDate).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
    (groups[day] ??= []).push(m);
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <Link href="/live" className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
        <ArrowLeft size={14} /> Back to Live
      </Link>

      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4">
        <p className="text-white font-bold text-lg">All Results</p>
        <p className="text-white/70 text-sm">{finished.length} matches played · tap any for full details</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>
      ) : finished.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">⚽</p>
          <p className="text-slate-400">No matches finished yet</p>
        </div>
      ) : (
        Object.entries(groups).map(([day, dayMatches]) => (
          <div key={day} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-3">{day}</p>
            <div className="space-y-2">
              {dayMatches.map((m) => (
                <Link key={m.id} href={`/live/${m.id}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-slate-600 transition-all">
                  <span className="text-white text-sm flex-1 text-right truncate">{m.home.name}</span>
                  <span className="text-white font-black min-w-[44px] text-center">{m.score.home ?? 0}-{m.score.away ?? 0}</span>
                  <span className="text-white text-sm flex-1 truncate">{m.away.name}</span>
                  <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
