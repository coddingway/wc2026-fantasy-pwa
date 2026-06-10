"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFantasyStore } from "@/lib/store";
import { Phone, LogOut, Cloud } from "lucide-react";

export default function LoginPage() {
  const { phone, login, signOut } = useAuth();
  const ownerName = useFantasyStore((s) => s.ownerName);
  const setOwnerName = useFantasyStore((s) => s.setOwnerName);
  const router = useRouter();
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (name.trim().length < 2) {
      setError("Enter your name first, homie.");
      return;
    }
    setBusy(true);
    const ok = await login(input);
    setBusy(false);
    if (!ok) {
      setError("Enter a valid phone number (at least 10 digits).");
      return;
    }
    setOwnerName(name.trim());
    // Go home — the gate will route to team-select only if the cloud
    // confirms this number has no favourite team yet.
    router.push("/");
  };

  if (phone) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto space-y-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-white font-bold text-lg">{ownerName ? `Welcome, ${ownerName}!` : "You're logged in, homie!"}</p>
          <p className="text-emerald-100 text-sm mt-1">{phone}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-emerald-500/30 flex items-center gap-3">
          <Cloud size={20} className="text-emerald-400" />
          <div>
            <p className="text-white text-sm font-semibold">Cloud Save Active</p>
            <p className="text-slate-400 text-xs">
              Your squad, transfers, captain & predictions save automatically.
              Log in with this number on any device and your latest data loads right up.
            </p>
          </div>
        </div>
        <button onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-300 font-bold py-3 rounded-xl transition-all">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-4">
      <div className="text-center mb-2">
        <p className="text-5xl mb-3">⚽</p>
        <p className="text-white font-black text-2xl">Grove Street FC</p>
        <p className="text-slate-400 text-sm">Enter your phone number — your squad saves to the cloud and follows you everywhere</p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div>
          <p className="text-white font-semibold mb-2">👤 Your Name</p>
          <input
            type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Carl Johnson"
            className="w-full bg-slate-800 text-white text-lg px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Phone size={16} className="text-emerald-400" />
            <p className="text-white font-semibold">Phone Number</p>
          </div>
          <input
            type="tel" inputMode="tel" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="98765 43210"
            className="w-full bg-slate-800 text-white text-lg px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 tracking-wide"
          />
          <p className="text-slate-500 text-xs mt-2">India numbers: just the 10 digits. Abroad: include country code, e.g. +44...</p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={handleLogin} disabled={busy || input.replace(/\D/g, "").length < 10 || name.trim().length < 2}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all">
          {busy ? "Logging in..." : "Login"}
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-2">What you get</p>
        {[
          "☁️ Squad, transfers & captain saved to the cloud — never resets",
          "📱 Same number = same team on every device",
          "🎨 Pick your nation, app wears its colors",
          "🏆 Create crew leagues & battle on leaderboards",
        ].map((b) => (
          <p key={b} className="text-slate-300 text-sm py-1">{b}</p>
        ))}
      </div>
    </div>
  );
}
