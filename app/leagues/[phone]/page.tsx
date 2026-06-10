"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getTeam } from "@/lib/themes";
import { SquadPlayer, Transfer } from "@/lib/types";
import { ArrowLeft, Crown, Trophy, ArrowRightLeft, Zap } from "lucide-react";

// Rival scouting view — everything a league member has done.

interface MemberState {
  ownerName?: string;
  teamName?: string;
  favoriteTeam?: string | null;
  totalPoints?: number;
  roundPoints?: Record<string, number>;
  squad?: SquadPlayer[];
  transfers?: Transfer[];
  boosters?: { id: string; name: string; icon: string; used: boolean }[];
  badges?: { id: string }[];
}

const posBadge = (pos: string) =>
  pos === "GK" ? "bg-yellow-500/20 text-yellow-400" :
  pos === "DEF" ? "bg-blue-500/20 text-blue-400" :
  pos === "MID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400";

export default function MemberProfilePage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone: raw } = use(params);
  const phone = decodeURIComponent(raw);
  const [state, setState] = useState<MemberState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/user/${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((d) => setState(d.state ?? null))
      .catch(() => setState(null))
      .finally(() => setLoading(false));
  }, [phone]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="px-4 py-16 max-w-lg mx-auto text-center">
        <p className="text-5xl mb-3">🫥</p>
        <p className="text-white font-bold">Player not found</p>
        <Link href="/leagues" className="text-emerald-400 text-sm font-semibold mt-2 inline-block">← Back to Leagues</Link>
      </div>
    );
  }

  const team = getTeam(state.favoriteTeam ?? null);
  const squad = state.squad ?? [];
  const starters = squad.filter((p) => p.isStarting);
  const bench = squad.filter((p) => !p.isStarting);
  const captain = squad.find((p) => p.isCaptain);
  const squadCost = squad.reduce((s, p) => s + p.price, 0);
  const nations = new Set(squad.map((p) => p.nation)).size;
  const rounds = Object.entries(state.roundPoints ?? {});
  const usedBoosters = (state.boosters ?? []).filter((b) => b.used);

  const PlayerRow = ({ p }: { p: SquadPlayer }) => (
    <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-xl">
      <span>{p.flag}</span>
      <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${posBadge(p.position)}`}>{p.position}</span>
      <span className="text-white text-sm flex-1 truncate">{p.knownName || `${p.firstName} ${p.lastName}`}</span>
      {p.isCaptain && <Crown size={12} className="text-yellow-400" />}
      {p.isViceCaptain && <span className="text-slate-400 text-[10px] font-bold">VC</span>}
      <span className="text-emerald-400 text-sm font-bold">${p.price}M</span>
    </div>
  );

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <Link href="/leagues" className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
        <ArrowLeft size={14} /> Back to Leagues
      </Link>

      {/* Profile header */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700 relative overflow-hidden">
        {team && (
          <div className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: `linear-gradient(90deg, ${team.flagColors.join(",")})` }} />
        )}
        <div className="flex items-center gap-4 mt-1">
          <span className="text-5xl">{team?.flag ?? "⚽"}</span>
          <div className="flex-1">
            <p className="text-white font-black text-xl">{state.ownerName || state.teamName || "Manager"}</p>
            <p className="text-slate-400 text-sm">{state.teamName}{team ? ` · supports ${team.name}` : ""}</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-400 font-black text-3xl">{state.totalPoints ?? 0}</p>
            <p className="text-slate-400 text-xs">points</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-blue-400 font-bold">{squad.length}/15</p>
          <p className="text-slate-400 text-xs">Squad</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-purple-400 font-bold">${squadCost.toFixed(1)}M</p>
          <p className="text-slate-400 text-xs">Spent</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-orange-400 font-bold">{nations}</p>
          <p className="text-slate-400 text-xs">Nations</p>
        </div>
      </div>

      {/* Gameweek points */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={14} className="text-yellow-400" />
          <p className="text-slate-400 text-xs font-semibold uppercase">Gameweek Points</p>
        </div>
        {rounds.length === 0 ? (
          <p className="text-slate-500 text-sm">No rounds scored yet — tournament just started</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {rounds.map(([round, pts]) => (
              <div key={round} className="bg-slate-800 rounded-xl p-2 text-center">
                <p className="text-slate-400 text-[10px] uppercase">{round}</p>
                <p className="text-emerald-400 font-black">{pts}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Their team */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">
          Their Team {captain && <span className="text-yellow-400 normal-case">· © {captain.knownName || captain.lastName}</span>}
        </p>
        {squad.length === 0 ? (
          <p className="text-slate-500 text-sm">Hasn't built a squad yet 👀</p>
        ) : (
          <>
            <p className="text-slate-500 text-[10px] uppercase mb-1">Starting XI</p>
            <div className="space-y-1 mb-3">{starters.map((p) => <PlayerRow key={p.id} p={p} />)}</div>
            {bench.length > 0 && (
              <>
                <p className="text-slate-500 text-[10px] uppercase mb-1">Bench</p>
                <div className="space-y-1 opacity-70">{bench.map((p) => <PlayerRow key={p.id} p={p} />)}</div>
              </>
            )}
          </>
        )}
      </div>

      {/* Transfers */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRightLeft size={14} className="text-blue-400" />
          <p className="text-slate-400 text-xs font-semibold uppercase">Transfer History</p>
        </div>
        {(state.transfers ?? []).length === 0 ? (
          <p className="text-slate-500 text-sm">No transfers made yet</p>
        ) : (
          <div className="space-y-2">
            {(state.transfers ?? []).map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-800 rounded-xl text-sm">
                <span className="text-red-400 truncate">{t.out?.knownName || t.out?.lastName}</span>
                <ArrowRightLeft size={12} className="text-slate-500 flex-shrink-0" />
                <span className="text-emerald-400 truncate">{t.in?.knownName || `${t.in?.firstName ?? ""} ${t.in?.lastName ?? ""}`}</span>
                <span className="text-slate-500 text-xs ml-auto flex-shrink-0">{t.round}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boosters used */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-orange-400" />
          <p className="text-slate-400 text-xs font-semibold uppercase">Boosters Used</p>
        </div>
        {usedBoosters.length === 0 ? (
          <p className="text-slate-500 text-sm">All boosters still in hand 🃏</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {usedBoosters.map((b) => (
              <span key={b.id} className="bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
