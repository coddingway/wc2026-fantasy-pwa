"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFantasyStore } from "@/lib/store";
import { Phone, LogOut, Cloud, UserPlus, LogIn, KeyRound } from "lucide-react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { phone, login, signup, signOut } = useAuth();
  const ownerName = useFantasyStore((s) => s.ownerName);
  const setOwnerName = useFantasyStore((s) => s.setOwnerName);
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const switchMode = (m: Mode) => { setMode(m); setError(""); setNotice(""); };

  const handleSubmit = async () => {
    setError(""); setNotice("");
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Enter your name to sign up.");
      return;
    }
    setBusy(true);

    if (mode === "signup") {
      const res = await signup(input, name.trim(), pin);
      setBusy(false);
      if (!res.ok) {
        setError(res.error ?? "Signup failed.");
        if (res.error?.includes("already has an account")) setMode("login");
        return;
      }
      setOwnerName(name.trim());
      router.push("/");
      return;
    }

    // Login
    const res = await login(input, pin);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      if (res.error?.includes("Sign Up first")) setMode("signup");
      return;
    }
    if (res.name) setOwnerName(res.name); // name auto-detected from cloud
    if (res.pinSet) setNotice("PIN saved — use it for every login from now on.");
    router.push("/");
  };

  // ---------- Logged in ----------
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
              Login on any device with this number — your data follows you.
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

  // ---------- Signup / Login ----------
  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-4 min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-2">
        <p className="text-5xl mb-3">⚽</p>
        <p className="text-white font-black text-2xl">WC2026 Fantasy</p>
        <p className="text-slate-400 text-sm">Build your squad. Battle the crew. Win the World Cup.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
        <button onClick={() => switchMode("login")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === "login" ? "bg-emerald-600 text-white" : "text-slate-400"}`}>
          <LogIn size={14} /> Login
        </button>
        <button onClick={() => switchMode("signup")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === "signup" ? "bg-emerald-600 text-white" : "text-slate-400"}`}>
          <UserPlus size={14} /> Sign Up
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        {mode === "signup" && (
          <div>
            <p className="text-white font-semibold mb-2">👤 Your Name</p>
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Carl Johnson"
              className="w-full bg-slate-800 text-white text-lg px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Phone size={16} className="text-emerald-400" />
            <p className="text-white font-semibold">Phone Number</p>
          </div>
          <input
            type="tel" inputMode="tel" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="98765 43210"
            className="w-full bg-slate-800 text-white text-lg px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 tracking-wide"
          />
          <p className="text-slate-500 text-xs mt-2">
            {mode === "login"
              ? "We'll recognise you — your name and team load automatically."
              : "India numbers: just the 10 digits. Abroad: include country code, e.g. +44..."}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={16} className="text-emerald-400" />
            <p className="text-white font-semibold">4-Digit PIN</p>
          </div>
          <input
            type="password" inputMode="numeric" maxLength={4} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••"
            className="w-full bg-slate-800 text-white text-2xl text-center px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 tracking-[0.5em] font-mono"
          />
          <p className="text-slate-500 text-xs mt-2">
            {mode === "signup"
              ? "Choose any 4 digits — this protects your team. Don't forget it!"
              : "The PIN you chose at signup."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3">
            <p className="text-red-400 text-sm font-semibold">⚠️ {error}</p>
          </div>
        )}
        {notice && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3">
            <p className="text-emerald-400 text-sm font-semibold">✅ {notice}</p>
          </div>
        )}

        <button onClick={handleSubmit}
          disabled={busy || input.replace(/\D/g, "").length < 10 || pin.length !== 4 || (mode === "signup" && name.trim().length < 2)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all">
          {busy ? "Checking..." : mode === "login" ? "Login" : "Create Account"}
        </button>

        <p className="text-slate-500 text-xs text-center">
          {mode === "login"
            ? <>New here? <button onClick={() => switchMode("signup")} className="text-emerald-400 font-bold">Sign Up</button></>
            : <>Already have an account? <button onClick={() => switchMode("login")} className="text-emerald-400 font-bold">Login</button></>}
        </p>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
        <p className="text-slate-400 text-xs font-semibold uppercase mb-2">What you get</p>
        {[
          "☁️ Squad & transfers saved to the cloud — never resets",
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
