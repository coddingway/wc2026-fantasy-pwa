"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Globe, Lock, Plus, Copy, RefreshCw, Crown } from "lucide-react";
import { useFantasyStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { createLeague, joinLeagueByCode, getMyLeagues, refreshMyMembership, type LeagueDoc, type MemberDoc } from "@/lib/leagues";
import { getTeam } from "@/lib/themes";

export default function LeaguesPage() {
  const { teamName, totalPoints, favoriteTeam } = useFantasyStore();
  const { phone, enabled } = useAuth();
  const [tab, setTab] = useState<"mine" | "create" | "join">("mine");
  const [myLeagues, setMyLeagues] = useState<{ league: LeagueDoc; members: MemberDoc[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"public" | "private">("private");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [created, setCreated] = useState("");

  const me = { teamName, favoriteTeam, points: totalPoints };

  const load = useCallback(async () => {
    if (!phone) return;
    setLoading(true);
    try {
      await refreshMyMembership(phone, me);
      setMyLeagues(await getMyLeagues(phone));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to load leagues");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, teamName, totalPoints, favoriteTeam]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!phone || !name.trim()) return;
    setMsg(""); setLoading(true);
    try {
      const l = await createLeague(phone, name.trim(), type, me);
      setCreated(l.code); setName(""); setTab("mine");
      await load();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Create failed"); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!phone || !code.trim()) return;
    setMsg(""); setLoading(true);
    try {
      await joinLeagueByCode(phone, code, me);
      setCode(""); setTab("mine");
      await load();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Join failed"); }
    finally { setLoading(false); }
  };

  if (!enabled || !phone) {
    return (
      <div className="px-4 py-12 max-w-lg mx-auto text-center space-y-4">
        <p className="text-5xl">🏆</p>
        <p className="text-white font-bold text-xl">Real Leagues Need Login</p>
        <p className="text-slate-400 text-sm">Log in with your phone to create leagues, invite the crew, and battle on live leaderboards.</p>
        <Link href="/login" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl">
          📱 Login to Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4">
        <Globe size={24} className="text-white/80 mb-2" />
        <p className="text-white font-bold text-lg">Crew Leagues</p>
        <p className="text-white/80 text-sm">Real leagues, real leaderboards — synced to the cloud</p>
      </div>

      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
        {(["mine", "create", "join"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? "bg-emerald-600 text-white" : "text-slate-400"}`}>
            {t === "mine" ? "🏆 Mine" : t === "create" ? "➕ Create" : "🔗 Join"}
          </button>
        ))}
      </div>

      {msg && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">{msg}</p></div>}
      {created && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-bold">League created! Share this code:</p>
          <p className="text-white text-2xl font-black font-mono tracking-widest">{created}</p>
          <button onClick={() => { navigator.clipboard.writeText(created); }} className="text-emerald-400 text-xs font-bold mt-1">📋 Copy Code</button>
        </div>
      )}

      {tab === "mine" && (
        <>
          <button onClick={load} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 py-2 rounded-xl text-sm font-semibold">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing..." : "Refresh Standings"}
          </button>
          {myLeagues.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🫥</p>
              <p className="text-slate-400 text-sm">No leagues yet. Create one and send the code to your crew!</p>
            </div>
          )}
          {myLeagues.map(({ league, members }) => (
            <div key={league.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {league.type === "private" ? <Lock size={14} className="text-purple-400" /> : <Globe size={14} className="text-blue-400" />}
                  <p className="text-white font-bold">{league.name}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(league.code)}
                  className="flex items-center gap-1 bg-slate-800 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                  <Copy size={10} /> {league.code}
                </button>
              </div>
              <div className="space-y-1">
                {members.map((m, i) => {
                  const t = getTeam(m.favoriteTeam);
                  const isMe = m.uid === phone;
                  return (
                    <div key={m.uid} className={`flex items-center gap-2 p-2 rounded-xl ${isMe ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800"}`}>
                      <span className={`font-black w-6 text-sm ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-slate-500"}`}>#{i + 1}</span>
                      <span>{t?.flag ?? "⚽"}</span>
                      <p className="text-white text-sm flex-1 truncate">{m.teamName}{isMe && <span className="text-emerald-400 text-xs"> (you)</span>}</p>
                      {league.ownerUid === m.uid && <Crown size={12} className="text-yellow-400" />}
                      <p className="text-emerald-400 font-bold text-sm">{m.points}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "create" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="League name (e.g. Grove Street Crew)"
            className="w-full bg-slate-800 text-white text-sm px-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500" />
          <div className="flex gap-2">
            {(["private", "public"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize flex items-center justify-center gap-1 transition-all ${type === t ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                {t === "private" ? <Lock size={12} /> : <Globe size={12} />} {t}
              </button>
            ))}
          </div>
          <button onClick={handleCreate} disabled={loading || !name.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            <Plus size={16} /> {loading ? "Creating..." : "Create League"}
          </button>
        </div>
      )}

      {tab === "join" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ENTER LEAGUE CODE"
            className="w-full bg-slate-800 text-white px-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center" />
          <button onClick={handleJoin} disabled={loading || !code.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl">
            {loading ? "Joining..." : "🔗 Join League"}
          </button>
        </div>
      )}
    </div>
  );
}
