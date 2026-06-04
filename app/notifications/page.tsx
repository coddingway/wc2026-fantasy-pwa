"use client";
import { useState } from "react";
import { Bell, Clock, Trophy, AlertTriangle, Zap } from "lucide-react";
import { ROUNDS } from "@/lib/squad-data";

export default function NotificationsPage() {
  const [settings, setSettings] = useState([
    { id: "lockout", label: "Transfer Window Alerts", desc: "2 hours before each lockout deadline", enabled: true },
    { id: "goals",   label: "Your Player Scored",     desc: "Instant alert when your player scores", enabled: true },
    { id: "injury",  label: "Injury Alerts",           desc: "When your squad player picks up an injury", enabled: true },
    { id: "captain", label: "Captain Reminder",        desc: "1 hour before kickoff if captain not set", enabled: false },
    { id: "autosub", label: "Auto-Sub Activated",      desc: "When bench player replaces a DNP starter", enabled: true },
    { id: "results", label: "Round Results",           desc: "Full round summary after all games", enabled: true },
  ]);
  const [granted, setGranted] = useState(false);

  const toggle = (id: string) => setSettings(s => s.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  const request = async () => {
    if ("Notification" in window) {
      const r = await Notification.requestPermission();
      setGranted(r === "granted");
      if (r === "granted") new Notification("WC2026 Fantasy", { body: "Notifications enabled! Grove Street 🟢" });
    }
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4">
        <Bell size={24} className="text-blue-200 mb-2" />
        <p className="text-white font-bold text-lg">Notification Centre</p>
        <p className="text-white/80 text-sm">{settings.filter(s=>s.enabled).length}/{settings.length} alerts active</p>
      </div>
      {!granted && (
        <button onClick={request} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
          🔔 Enable Push Notifications
        </button>
      )}
      {granted && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center"><p className="text-emerald-400 text-sm font-semibold">✓ Notifications enabled</p></div>}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {settings.map(s => (
          <div key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-white text-sm">{s.label}</p>
              <p className="text-slate-400 text-xs">{s.desc}</p>
            </div>
            <button onClick={() => toggle(s.id)} className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${s.enabled ? "bg-blue-500" : "bg-slate-700"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mx-0.5 ${s.enabled ? "translate-x-6" : ""}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Upcoming Alerts</p>
        {ROUNDS.slice(0,4).map(r => (
          <div key={r.id} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
            <div><p className="text-white text-sm">{r.name}</p><p className="text-slate-400 text-xs">{r.date}</p></div>
            <span className="text-blue-400 text-xs font-bold">Scheduled</span>
          </div>
        ))}
      </div>
      <button onClick={() => granted ? new Notification("Test 🧪", { body: "Kane just scored! 🔥" }) : alert("Enable notifications first")}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl">
        🧪 Send Test Notification
      </button>
    </div>
  );
}
