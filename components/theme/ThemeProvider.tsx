"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFantasyStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { applyTeamTheme } from "@/lib/themes";

export default function ThemeProvider() {
  const favoriteTeam = useFantasyStore((s) => s.favoriteTeam);
  const cloudLoaded = useFantasyStore((s) => s.cloudLoaded);
  const { phone, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Apply team colors whenever the selection changes
  useEffect(() => {
    applyTeamTheme(favoriteTeam);
  }, [favoriteTeam]);

  // Gate 1: login is mandatory — no phone, no entry.
  // Gate 2: after login AND after cloud data has loaded, picking a
  //         favourite team is mandatory. (Waiting for cloudLoaded prevents
  //         bouncing returning users to team-select before their saved
  //         team arrives from the cloud.)
  useEffect(() => {
    if (loading) return;
    if (!phone) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }
    if (!cloudLoaded) return; // cloud still fetching — don't judge yet
    if (!favoriteTeam && pathname !== "/team-select" && pathname !== "/login") {
      router.replace("/team-select");
    }
  }, [phone, loading, cloudLoaded, favoriteTeam, pathname, router]);

  return null;
}
