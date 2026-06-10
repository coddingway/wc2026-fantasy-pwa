"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFantasyStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { applyTeamTheme } from "@/lib/themes";

export default function ThemeProvider() {
  const favoriteTeam = useFantasyStore((s) => s.favoriteTeam);
  const { phone, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Apply team colors whenever the selection changes
  useEffect(() => {
    applyTeamTheme(favoriteTeam);
  }, [favoriteTeam]);

  // After login, picking a favourite team is mandatory
  useEffect(() => {
    if (loading || !phone) return;
    if (!favoriteTeam && pathname !== "/team-select" && pathname !== "/login") {
      router.replace("/team-select");
    }
  }, [phone, loading, favoriteTeam, pathname, router]);

  return null;
}
