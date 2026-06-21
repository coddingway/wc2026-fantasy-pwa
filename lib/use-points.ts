"use client";
import { useEffect, useState } from "react";
import { useFantasyStore } from "./store";

// Fetches computed fantasy points for the current squad and writes them
// into the store (which auto-saves to cloud + updates leagues).
export function usePointsSync() {
  const squad = useFantasyStore((s) => s.squad);
  const setComputedPoints = useFantasyStore((s) => s.setComputedPoints);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<{ configured: boolean; finishedCount: number }>({ configured: true, finishedCount: 0 });

  useEffect(() => {
    if (!squad.length) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ squad }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setInfo({ configured: d.configured !== false, finishedCount: d.finishedCount ?? 0 });
        if (d.configured !== false) {
          const perPlayer: Record<number, number> = {};
          const breakdown: Record<number, Record<string, number>> = {};
          const rounds: Record<number, Record<string, Record<string, number>>> = {};
          for (const [id, b] of Object.entries(d.perPlayer ?? {})) {
            perPlayer[Number(id)] = (b as { total: number }).total;
            breakdown[Number(id)] = b as Record<string, number>;
          }
          for (const [id, r] of Object.entries(d.perPlayerRound ?? {})) rounds[Number(id)] = r as Record<string, Record<string, number>>;
          setComputedPoints(d.total ?? 0, d.byRound ?? {}, perPlayer, breakdown, rounds);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squad.length]);

  return { loading, ...info };
}
