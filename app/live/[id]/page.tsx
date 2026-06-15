"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Flag, Clock, Trophy } from "lucide-react";
import { nationOf } from "@/lib/nations";
import { getTeam } from "@/lib/themes";

interface TimelineEvent {
  type: "goal" | "yellow" | "red";
  player: string; assist: string | null; code: string | null;
  minute: number; penalty: boolean; ownGoal: boolean;
}

const GOAL_PTS: Record<string, number> = { GK: 9, DEF: 7, MID: 6, FWD: 5 };
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

// position lookup index: "code|normname" -> position
function buildPosIndex(players: any[]): Record<string, string> {
  const idx: Record<string, string> = {};
  for (const p of players) {
    const { code } = nationOf(p.squadId);
    const ln = norm(p.lastName || "");
    const kn = norm(p.knownName || "");
    if (ln) idx[`${code}|${ln}`] = p.position;
    if (kn) idx[`${code}|${kn}`] = p.position;
  }
  return idx;
}
function lookupPos(idx: Record<string, string>, name: string, code: string | null): string | null {
  if (!code) return null;
  const n = norm(name);
  if (idx[`${code}|${n}`]) return idx[`${code}|${n}`];
  // try last word
  const parts = name.trim().split(/\s+/);
  const last = norm(parts[parts.length - 1]);
  return idx[`${code}|${last}`] ?? null;
}

interface BreakdownRow { name: string; code: string | null; pos: string | null; points: number; notes: string[]; }
interface MatchDetail {
  configured: boolean;
  status?: string;
  minute?: number | null;
  utcDate?: string;
  group?: string | null;
  matchday?: number | null;
  stage?: string | null;
  venue?: string | null;
  home?: { name: string; tla: string; crest: string };
  away?: { name: string; tla: string; crest: string };
  score?: { winner: string | null; full: { home: number | null; away: number | null }; half: { home: number | null; away: number | null } };
  referees?: { name: string; role: string; nationality: string }[];
  timeline?: TimelineEvent[];
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled", TIMED: "Upcoming", IN_PLAY: "LIVE", PAUSED: "Half Time",
  FINISHED: "Full Time", SUSPENDED: "Suspended", POSTPONED: "Postponed",
};

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [m, setM] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [posIdx, setPosIdx] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = () => fetch(`/api/fixtures/${id}`).then((r) => r.json()).then(setM).catch(() => {}).finally(() => setLoading(false));
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => {
    fetch("/players.json").then((r) => r.json()).then((p) => setPosIdx(buildPosIndex(p))).catch(() => {});
  }, []);

  // Fantasy points for a single goal/card event (for the scorer)
  const eventPts = (ev: TimelineEvent, pos: string | null): number => {
    if (ev.type === "goal") return ev.ownGoal ? -2 : (pos ? GOAL_PTS[pos] : 5);
    if (ev.type === "yellow") return -1;
    if (ev.type === "red") return -2;
    return 0;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>;
  }
  if (!m || !m.home || !m.away) {
    return (
      <div className="px-4 py-16 max-w-lg mx-auto text-center">
        <p className="text-5xl mb-3">🤷</p>
        <p className="text-white font-bold">Match not found</p>
        <Link href="/live" className="text-emerald-400 text-sm font-semibold mt-2 inline-block">← Back to Live</Link>
      </div>
    );
  }

  const live = m.status === "IN_PLAY" || m.status === "PAUSED";
  const finished = m.status === "FINISHED";
  const showScore = live || finished;
  const fh = m.score?.full.home ?? 0, fa = m.score?.full.away ?? 0;
  const tl = m.timeline ?? [];

  // Build per-player fantasy breakdown from events
  const bd: Record<string, BreakdownRow> = {};
  const row = (name: string, code: string | null) => {
    const k = `${code ?? ""}|${norm(name)}`;
    return (bd[k] ??= { name, code, pos: lookupPos(posIdx, name, code), points: 0, notes: [] });
  };
  for (const ev of tl) {
    if (ev.type === "goal") {
      if (ev.ownGoal) { const r = row(ev.player, ev.code); r.points -= 2; r.notes.push(`Own goal ${ev.minute}' (-2)`); }
      else {
        const r = row(ev.player, ev.code); const pts = r.pos ? GOAL_PTS[r.pos] : 5;
        r.points += pts; r.notes.push(`Goal ${ev.minute}'${ev.penalty ? " (pen)" : ""} (+${pts})`);
        if (ev.assist) { const a = row(ev.assist, ev.code); a.points += 3; a.notes.push(`Assist ${ev.minute}' (+3)`); }
      }
    } else if (ev.type === "yellow") { const r = row(ev.player, ev.code); r.points -= 1; r.notes.push(`Yellow ${ev.minute}' (-1)`); }
    else if (ev.type === "red") { const r = row(ev.player, ev.code); r.points -= 2; r.notes.push(`Red ${ev.minute}' (-2)`); }
  }
  const breakdown = Object.values(bd).sort((a, b) => b.points - a.points);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <Link href="/live" className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
        <ArrowLeft size={14} /> Back to Live
      </Link>

      {/* Scoreboard */}
      <div className={`rounded-2xl p-5 border ${live ? "border-red-500/40 bg-red-500/5" : "border-slate-800 bg-slate-900"}`}>
        <div className="text-center mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${live ? "bg-red-500/20 text-red-400 animate-pulse" : finished ? "bg-slate-700 text-slate-300" : "bg-emerald-500/20 text-emerald-400"}`}>
            {live && m.minute != null ? `${m.minute}' LIVE` : STATUS_LABEL[m.status ?? ""] ?? m.status}
          </span>
          {(m.group || m.matchday) && (
            <p className="text-slate-500 text-xs mt-2">{m.group}{m.matchday ? ` · Matchday ${m.matchday}` : ""}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            {m.home.crest && <img src={m.home.crest} alt="" className="w-14 h-14 mx-auto mb-2 object-contain" />}
            <p className="text-white font-bold text-sm">{m.home.name}</p>
          </div>
          <div className="text-center px-2">
            {showScore ? (
              <p className="text-white font-black text-4xl">{fh}<span className="text-slate-600 mx-1">-</span>{fa}</p>
            ) : (
              <p className="text-slate-400 text-lg font-bold">
                {m.utcDate && new Date(m.utcDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {finished && m.score?.half && m.score.half.home != null && (
              <p className="text-slate-500 text-xs mt-1">HT {m.score.half.home}-{m.score.half.away}</p>
            )}
          </div>
          <div className="flex-1 text-center">
            {m.away.crest && <img src={m.away.crest} alt="" className="w-14 h-14 mx-auto mb-2 object-contain" />}
            <p className="text-white font-bold text-sm">{m.away.name}</p>
          </div>
        </div>
      </div>

      {/* Fantasy Points Breakdown */}
      {breakdown.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-emerald-500/30">
          <p className="text-emerald-400 text-xs font-semibold uppercase mb-3">⚡ Fantasy Points from this Match</p>
          <div className="space-y-2">
            {breakdown.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-2 bg-slate-800 rounded-xl">
                <span className="text-base flex-shrink-0">{getTeam(r.code)?.flag ?? "⚽"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{r.name}</p>
                    {r.pos && <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${r.pos === "GK" ? "bg-yellow-500/20 text-yellow-400" : r.pos === "DEF" ? "bg-blue-500/20 text-blue-400" : r.pos === "MID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{r.pos}</span>}
                  </div>
                  <p className="text-slate-400 text-xs">{r.notes.join(" · ")}</p>
                </div>
                <span className={`font-black text-lg flex-shrink-0 ${r.points >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {r.points >= 0 ? "+" : ""}{r.points}
                </span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-[10px] mt-2">
            Points shown are for goals, assists & cards. Appearance (+2) & clean-sheet (+5) are added in your squad total.
          </p>
        </div>
      )}

      {/* No detail yet for finished matches */}
      {finished && tl.length === 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-yellow-500/30 flex gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-yellow-400 text-sm font-semibold">Goal & card details coming soon</p>
            <p className="text-slate-400 text-xs mt-1">
              The final score is confirmed, but this match's goal-by-goal breakdown
              hasn't been published yet. It appears automatically once the data feed updates.
            </p>
          </div>
        </div>
      )}

      {/* Goal & card timeline */}
      {tl.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Match Timeline</p>
          <div className="space-y-2">
            {[...tl].sort((a, b) => a.minute - b.minute).map((ev, i) => {
              const onHome = ev.code === m.home?.tla;
              const icon = ev.type === "goal" ? "⚽" : ev.type === "red" ? "🟥" : "🟨";
              const pos = lookupPos(posIdx, ev.player, ev.code);
              const pts = eventPts(ev, pos);
              return (
                <div key={i} className={`flex items-center gap-2 ${onHome ? "" : "flex-row-reverse text-right"}`}>
                  <span className="text-slate-500 text-xs font-mono w-8">{ev.minute}'</span>
                  <span className="text-base">{icon}</span>
                  <div className={onHome ? "flex-1" : "flex-1 flex flex-col items-end"}>
                    <p className="text-white text-sm">
                      {ev.player}
                      {ev.penalty && <span className="text-slate-400 text-xs"> (pen)</span>}
                      {ev.ownGoal && <span className="text-red-400 text-xs"> (OG)</span>}
                      <span className={`text-xs font-bold ml-1 ${pts >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pts >= 0 ? "+" : ""}{pts}</span>
                    </p>
                    {ev.assist && <p className="text-slate-500 text-xs">assist: {ev.assist} <span className="text-emerald-400">+3</span></p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match info */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
        <p className="text-slate-400 text-xs font-semibold uppercase">Match Info</p>
        {m.utcDate && (
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-slate-500" />
            <p className="text-white text-sm">{new Date(m.utcDate).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
        )}
        {m.utcDate && (
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-slate-500" />
            <p className="text-white text-sm">{new Date(m.utcDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (your time)</p>
          </div>
        )}
        {m.venue && (
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-slate-500" />
            <p className="text-white text-sm">{m.venue}</p>
          </div>
        )}
        {m.stage && (
          <div className="flex items-center gap-3">
            <Trophy size={16} className="text-slate-500" />
            <p className="text-white text-sm capitalize">{m.stage.toLowerCase().replace(/_/g, " ")}</p>
          </div>
        )}
      </div>

      {/* Officials */}
      {m.referees && m.referees.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Match Officials</p>
          <div className="space-y-2">
            {m.referees.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <Flag size={14} className="text-slate-500" />
                <p className="text-white text-sm flex-1">{r.name}</p>
                <span className="text-slate-400 text-xs capitalize">{(r.role ?? "").toLowerCase().replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data note */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-500 text-xs">
          ℹ️ Goals, assists & cards feed your fantasy points automatically.
          Full lineups & per-player stats (saves/tackles) need a premium feed.
        </p>
      </div>
    </div>
  );
}
