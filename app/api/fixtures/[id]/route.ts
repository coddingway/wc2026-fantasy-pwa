import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;

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
    return NextResponse.json({
      configured: true,
      id: m.id,
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
