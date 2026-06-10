"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as fbSignOut,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  enabled: boolean;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  enabled: false,
  sendOTP: async () => {},
  verifyOTP: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const sendOTP = async (phone: string) => {
    if (!auth) throw new Error("Firebase not configured");
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    confirmRef.current = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
  };

  const verifyOTP = async (code: string) => {
    if (!confirmRef.current) throw new Error("Request an OTP first");
    await confirmRef.current.confirm(code);
  };

  const signOut = async () => {
    if (auth) await fbSignOut(auth);
  };

  return (
    <Ctx.Provider value={{ user, loading, enabled: firebaseEnabled, sendOTP, verifyOTP, signOut }}>
      {children}
      <div id="recaptcha-container" />
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
