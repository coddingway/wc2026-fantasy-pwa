"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Simple phone-number identity. The number IS the account key.
// Data: localStorage (zustand persist) + Vercel/Neon cloud via CloudSync.

const STORAGE_KEY = "gs-phone";

export function normalizePhone(raw: string): string | null {
  const digits = raw.trim().replace(/[^\d+]/g, "");
  const full = digits.startsWith("+") ? digits : `+91${digits}`;
  return full.replace(/\D/g, "").length >= 10 ? full : null;
}

interface AuthCtx {
  phone: string | null;
  loading: boolean;
  enabled: boolean;
  login: (raw: string) => Promise<boolean>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({
  phone: null,
  loading: true,
  enabled: true,
  login: async () => false,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setPhone(saved);
    setLoading(false);
  }, []);

  const login = async (raw: string): Promise<boolean> => {
    const normalized = normalizePhone(raw);
    if (!normalized) return false;
    localStorage.setItem(STORAGE_KEY, normalized);
    setPhone(normalized);
    return true;
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPhone(null);
  };

  return (
    <Ctx.Provider value={{ phone, loading, enabled: true, login, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
