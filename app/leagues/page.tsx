"use client";
import { useState } from "react";
import { Globe, Lock, Plus, Copy, Share2 } from "lucide-react";
import { useFantasyStore } from "@/lib/store";

interface League { id:string; name:string; code:string; type:"public"|"private"; members:number; myRank:number; myPoints:number; leader:string; leaderPoints:number; }

const INIT: League[] = [
  { id:"gs1", name:"Grove Street Classic", code:"GS2026", type:"private", members:8, myRank:2, myPoints:198, leader:"Balogun's Boys", leaderPoints:234 },
  { id:"pub1", name:"India WC2026 League", code:"INDIA26", type:"public", members:4821, myRank:312, myPoints:198, leader:"Mumbai FC", leaderPoints:287 },
  { id:"pub2", name:"Global Top 1000", code:"GLOB26", type:"public", members:98403, myRank:15201, myPoints:198, leader:"Fantasy King", leaderPoints:334 },
];

export default function LeaguesPage() {
  const { teamName } = useFantasyStore();
  const [leagues, setLeagues] = useState(INIT);
  const [tab, setTab] = useState<"mine"|"create"|"join">("mine");
  const [name, setName] = useState("");
  const [type, setType] = useState<"public"|"private">("private");
  const [code, setCode] = useState("");
  const [created, setCreated] = useState("");

  const create = () => {
    if (!name.trim()) return;
    const c = name.replace(/\s/g,"").toUpperCase().slice(0,6) + Math.floor(Math.random()*999);
    setLeagues(l => [...l, { id:Date.now().toString(), name, code:c, type, members:1, myRank:1, myPoints:0, leader:teamName, leaderPoints:0 }]);
    setCreated(c); setName("");
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-4">
        <Globe size={24} className="text-green-200 mb-2" />
        <p className="text-white font-bold text-lg">Fantasy Leagues</p>
        <p className="text-white/80 text-sm">Compete with friends and the world</p>
      </div>
      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
        {(["mine","create","join"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab===t?"bg-emerald-600 text-white":"text-slate-400"}`}>
            {t==="mine"?"🏆 Mine":t==="create"?"➕ Create":"🔗 Join"}
          </button>
        ))}
      </div>

      {tab==="mine" && leagues.map(l => (
        <div key={l.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-1 mb-1">
                {l.type==="private"?<Lock size={12} className="text-purple-400"/>:<Globe size={12} className="text-blue-400"/>}
                <p className="text-white font-bold">{l.name}</p>
              </div>
              <p className="text-slate-400 text-xs">{l.members.toLocaleString()} members</p>
            </div>
            <div className="text-right"><p className="text-emerald-400 font-black text-xl">#{l.myRank}</p><p className="text-slate-400 text-xs">{l.myPoints} pts</p></div>
          </div>
          <div className="bg-slate-800 rounded-xl p-2 flex justify-between mb-3">
            <div><p className="text-slate-400 text-xs">Leader</p><p className="text-white text-sm">{l.leader}</p></div>
            <p className="text-yellow-400 font-bold">{l.leaderPoints} pts</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>navigator.clipboard.writeText(l.code)} className="flex-1 flex items-center justify-center gap-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold">
              <Copy size={12}/> {l.code}
            </button>
          </div>
        </div>
      ))}

      {tab==="create" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
          <p className="text-white font-semibold">Create League</p>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="League name..."
            className="w-full bg-slate-800 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"/>
          <div className="flex gap-2">
            {(["private","public"] as const).map(t=>(
              <button key={t} onClick={()=>setType(t)} className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize flex items-center justify-center gap-1 transition-all ${type===t?"bg-emerald-600 text-white":"bg-slate-800 text-slate-400"}`}>
                {t==="private"?<Lock size={12}/>:<Globe size={12}/>}{t}
              </button>
            ))}
          </div>
          <button onClick={create} disabled={!name.trim()} className="w-full bg-emerald-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            <Plus size={16}/> Create League
          </button>
          {created && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-bold">League Created! 🎉</p>
            <p className="text-white text-xl font-black">{created}</p>
            <p className="text-slate-400 text-xs">Share this code with friends</p>
          </div>}
        </div>
      )}

      {tab==="join" && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
          <p className="text-white font-semibold">Join with Code</p>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ENTER CODE"
            className="w-full bg-slate-800 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center"/>
          <button onClick={()=>{alert(`Joining: ${code}`);setCode("");}} disabled={!code.trim()}
            className="w-full bg-blue-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl">🔗 Join League</button>
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <p className="text-slate-400 text-xs font-semibold uppercase">Popular Leagues</p>
            {[{n:"India WC2026",c:"INDIA26",m:"12,481"},{n:"Global Elite",c:"GLOB26",m:"98,403"}].map(l=>(
              <div key={l.c} className="flex items-center justify-between py-2 border-b border-slate-800">
                <div><p className="text-white text-sm">{l.n}</p><p className="text-slate-400 text-xs">{l.m} members</p></div>
                <button onClick={()=>setCode(l.c)} className="text-emerald-400 text-xs font-bold">{l.c}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
