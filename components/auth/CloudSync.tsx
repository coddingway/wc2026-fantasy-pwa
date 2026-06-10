"use client";
import { useEffect, useRef } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useFantasyStore } from "@/lib/store";

// Per-phone cloud save. On login: cloud data wins (fetch + show updated).
// If no cloud data yet: lift local progress up. After that: every change
// writes to Firestore (debounced) AND stays in localStorage via zustand.

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
  const { phone } = useAuth();
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On login: fetch cloud state and show it (cloud is source of truth)
  useEffect(() => {
    loaded.current = false;
    if (!phone || !db) return;
    const ref = doc(db, "users", phone);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const patch: Record<string, unknown> = {};
          for (const k of SYNC_KEYS) if (k in data) patch[k] = data[k];
          useFantasyStore.setState(patch);
        } else {
          // First login for this number — push local progress to the cloud
          setDoc(ref, { ...pickState(), phone, updatedAt: serverTimestamp() }).catch(() => {});
        }
        loaded.current = true;
      })
      .catch(() => { loaded.current = true; }); // offline/rules issue: stay local
  }, [phone]);

  // Every change → debounced cloud write (localStorage handled by zustand persist)
  useEffect(() => {
    if (!phone || !db) return;
    const unsub = useFantasyStore.subscribe(() => {
      if (!loaded.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setDoc(doc(db!, "users", phone), { ...pickState(), phone, updatedAt: serverTimestamp() }, { merge: true })
          .catch(() => {});
      }, 1500);
    });
    return () => {
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phone]);

  return null;
}
