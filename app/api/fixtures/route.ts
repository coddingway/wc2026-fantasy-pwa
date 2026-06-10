import { NextResponse } from "next/server";

// Proxies football-data.org (free tier) for FIFA World Cup fixtures & live scores.
// Competition code "WC" = FIFA World Cup. Key stays server-side.
// Cached 60s — free tier allows 10 req/min, this keeps us miles under.

export const revalidate = 60;

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED
  minute: number | null;
  group: string | null;
  home: { name: string; tla: string; crest: string };
  away: { name: string; tla: string; crest: string };
  score: { home: number | null; away: number | null };
}

export async function GET() {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    return NextResponse.json({ configured: false, matches: [] });
  }

  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { configured: true, error: `Upstream ${res.status}`, matches: [] },
        { status: 502 }
      );
    }
    const data = await res.json();
    const matches: ApiMatch[] = (data.matches ?? []).map((m: any) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      minute: m.minute ?? null,
      group: m.group?.replace("GROUP_", "Group ") ?? null,
      home: { name: m.homeTeam?.name ?? "TBD", tla: m.homeTeam?.tla ?? "", crest: m.homeTeam?.crest ?? "" },
      away: { name: m.awayTeam?.name ?? "TBD", tla: m.awayTeam?.tla ?? "", crest: m.awayTeam?.crest ?? "" },
      score: { home: m.score?.fullTime?.home ?? null, away: m.score?.fullTime?.away ?? null },
    }));
    return NextResponse.json({ configured: true, matches });
  } catch {
    return NextResponse.json({ configured: true, error: "fetch_failed", matches: [] }, { status: 502 });
  }
}
