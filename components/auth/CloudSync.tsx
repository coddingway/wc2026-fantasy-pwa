"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFantasyStore, INITIAL_FANTASY_STATE } from "@/lib/store";

// Per-phone cloud save via /api/user (Vercel + Neon Postgres).
// On login: cloud state fetched and shown (cloud wins). First login lifts
// local progress up. After that: localStorage (zustand) + debounced cloud PUT.

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

  // On login: cloud-first load
  useEffect(() => {
    loaded.current = false;
    if (!phone) return;
    const url = `/api/user/${encodeURIComponent(phone)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.state) {
          // Returning user — cloud data wins
          const patch: Record<string, unknown> = {};
          for (const k of SYNC_KEYS) if (k in data.state) patch[k] = data.state[k];
          useFantasyStore.setState(patch);
        } else {
          // BRAND-NEW number — fresh start. Wipe any leftover device state
          // so the new user sets up their own team from scratch.
          // (Preserve favoriteTeam in case they already picked it this session.)
          const { favoriteTeam } = useFantasyStore.getState();
          useFantasyStore.setState({ ...INITIAL_FANTASY_STATE, favoriteTeam });
          if (data.configured) {
            fetch(url, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ state: pickState() }),
            }).catch(() => {});
          }
        }
        loaded.current = true;
      })
      .catch(() => { loaded.current = true; }); // offline → stay local
  }, [phone]);

  // Every change → debounced cloud write
  useEffect(() => {
    if (!phone) return;
    const unsub = useFantasyStore.subscribe(() => {
      if (!loaded.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        fetch(`/api/user/${encodeURIComponent(phone)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: pickState() }),
        }).catch(() => {});
      }, 1500);
    });
    return () => {
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phone]);

  return null;
}
