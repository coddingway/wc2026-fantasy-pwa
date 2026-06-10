"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

// Simple phone-number identity (no OTP, friends-crew app).
// The number IS the account key. Cloud features use an invisible
// anonymous Firebase session purely to satisfy Firestore rules.

const STORAGE_KEY = "gs-phone";

export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d+]/g, "");
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
  enabled: false,
  login: async () => false,
  signOut: () => {},
});

async function ensureCloudSession() {
  if (!firebaseEnabled || !auth) return;
  try {
    if (!auth.currentUser) await signInAnonymously(auth);
  } catch {
    // Anonymous provider not enabled yet — cloud sync will no-op, local still works
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      setPhone(saved);
      ensureCloudSession();
    }
    setLoading(false);
  }, []);

  const login = async (raw: string): Promise<boolean> => {
    const normalized = normalizePhone(raw);
    if (!normalized) return false;
    await ensureCloudSession();
    localStorage.setItem(STORAGE_KEY, normalized);
    setPhone(normalized);
    return true;
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPhone(null);
  };

  return (
    <Ctx.Provider value={{ phone, loading, enabled: firebaseEnabled, login, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
