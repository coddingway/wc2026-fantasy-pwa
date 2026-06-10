"use client";
import { useEffect, useRef } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useFantasyStore } from "@/lib/store";

// Keys of the store we persist to the cloud (state only, no functions)
const SYNC_KEYS = [
  "squad", "budget", "totalBudget", "totalPoints", "roundPoints",
  "transfers", "freeTransfersRemaining", "boosters", "predictions",
  "badges", "teamName", "notifications", "darkMode", "favoriteTeam",
] as const;

function pickState() {
  const s = useFantasyStore.getState() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of SYNC_KEYS) out[k] = s[k];
  return out;
}

export default function CloudSync() {
  const { user } = useAuth();
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On login: load cloud state (or migrate local state up on first login)
  useEffect(() => {
    loaded.current = false;
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const patch: Record<string, unknown> = {};
        for (const k of SYNC_KEYS) if (k in data) patch[k] = data[k];
        useFantasyStore.setState(patch);
      } else {
        // First login — lift existing local progress to the cloud
        setDoc(ref, { ...pickState(), phone: user.phoneNumber, updatedAt: serverTimestamp() });
      }
      loaded.current = true;
    });
  }, [user]);

  // On any change: debounced write to Firestore
  useEffect(() => {
    if (!user || !db) return;
    const unsub = useFantasyStore.subscribe(() => {
      if (!loaded.current) return; // don't write while hydrating
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const ref = doc(db!, "users", user.uid);
        setDoc(ref, { ...pickState(), phone: user.phoneNumber, updatedAt: serverTimestamp() }, { merge: true });
      }, 1500);
    });
    return () => {
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user]);

  return null;
}
