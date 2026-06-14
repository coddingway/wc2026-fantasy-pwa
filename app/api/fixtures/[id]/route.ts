import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export const revalidate = 60;

async function timelineFor(homeTla?: string, awayTla?: string) {
  if (!sql || !homeTla || !awayTla) return [];
  try {
    await ensureSchema();
    const rows = await sql`SELECT events FROM match_cache
      WHERE (home_code = ${homeTla} AND away_code = ${awayTla})
         OR (home_code = ${awayTla} AND away_code = ${homeTla}) LIMIT 1`;
    return (rows[0]?.events ?? []) as any[];
  } catch { return []; }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return NextResponse.json({ configured: false });
  const { id } = await params;
  try {
    const res = await fetch(`https://api.football-data.org/v4/matches/${id}`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json({ configured: true, error: `upstream_${res.status}` }, { status: 502 });
    const m = await res.json();
    const timeline = await timelineFor(m.homeTeam?.tla, m.awayTeam?.tla);
    return NextResponse.json({
      configured: true,
      id: m.id,
      timeline,
      status: m.status,
      minute: m.minute ?? null,
      utcDate: m.utcDate,
      group: m.group?.replace("GROUP_", "Group ") ?? null,
      matchday: m.matchday ?? null,
      stage: m.stage ?? null,
      venue: m.venue ?? null,
      home: { name: m.homeTeam?.name, tla: m.homeTeam?.tla, crest: m.homeTeam?.crest },
      away: { name: m.awayTeam?.name, tla: m.awayTeam?.tla, crest: m.awayTeam?.crest },
      score: {
        winner: m.score?.winner ?? null,
        full: m.score?.fullTime ?? { home: null, away: null },
        half: m.score?.halfTime ?? { home: null, away: null },
      },
      referees: (m.referees ?? []).map((r: any) => ({ name: r.name, role: r.role, nationality: r.nationality })),
    });
  } catch {
    return NextResponse.json({ configured: true, error: "fetch_failed" }, { status: 502 });
  }
}
