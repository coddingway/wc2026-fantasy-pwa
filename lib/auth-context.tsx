"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useFantasyStore, INITIAL_FANTASY_STATE } from "./store";

// Phone + 4-digit PIN identity. Viewing accounts is open (league scouting);
// any WRITE to an account requires the PIN.

const PHONE_KEY = "gs-phone";
const PIN_KEY = "gs-pin";

export function normalizePhone(raw: string): string | null {
  const digits = raw.trim().replace(/[^\d+]/g, "");
  const full = digits.startsWith("+") ? digits : `+91${digits}`;
  return full.replace(/\D/g, "").length >= 10 ? full : null;
}

export function getStoredPin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PIN_KEY);
}

type AuthResult = { ok: boolean; error?: string; name?: string | null; pinSet?: boolean };

async function callAuth(body: Record<string, unknown>): Promise<AuthResult & { configured?: boolean }> {
  try {
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.configured === false) return { ok: true, configured: false }; // local-only mode
    if (!r.ok) return { ok: false, error: d.error ?? "Request failed" };
    return { ok: true, name: d.name ?? null, pinSet: d.pinSet };
  } catch {
    return { ok: true, configured: false }; // offline — let them in locally
  }
}

interface AuthCtx {
  phone: string | null;
  loading: boolean;
  enabled: boolean;
  signup: (rawPhone: string, name: string, pin: string) => Promise<AuthResult>;
  login: (rawPhone: string, pin: string) => Promise<AuthResult>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({
  phone: null,
  loading: true,
  enabled: true,
  signup: async () => ({ ok: false }),
  login: async () => ({ ok: false }),
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PHONE_KEY) : null;
    if (saved) setPhone(saved);
    setLoading(false);
  }, []);

  const persist = (full: string, pin: string) => {
    localStorage.setItem(PHONE_KEY, full);
    localStorage.setItem(PIN_KEY, pin);
    setPhone(full);
  };

  const signup = async (rawPhone: string, name: string, pin: string): Promise<AuthResult> => {
    const full = normalizePhone(rawPhone);
    if (!full) return { ok: false, error: "Enter a valid phone number (at least 10 digits)." };
    const res = await callAuth({ action: "signup", phone: full, name, pin });
    if (!res.ok) return res;
    persist(full, pin);
    return { ok: true };
  };

  const login = async (rawPhone: string, pin: string): Promise<AuthResult> => {
    const full = normalizePhone(rawPhone);
    if (!full) return { ok: false, error: "Enter a valid phone number (at least 10 digits)." };
    const res = await callAuth({ action: "login", phone: full, pin });
    if (!res.ok) return res;
    persist(full, pin);
    return res;
  };

  const signOut = () => {
    localStorage.removeItem(PHONE_KEY);
    localStorage.removeItem(PIN_KEY);
    setPhone(null);
    useFantasyStore.setState({ ...INITIAL_FANTASY_STATE });
  };

  return (
    <Ctx.Provider value={{ phone, loading, enabled: true, signup, login, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
