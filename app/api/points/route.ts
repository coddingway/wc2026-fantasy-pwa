import { NextRequest, NextResponse } from "next/server";
import { computePoints, FinishedMatch, SquadLite } from "@/lib/points-engine";
import { syncResults, getMatchEvents } from "@/lib/results-sync";

export const revalidate = 300; // 5 min cache on upstream

async function fetchFootball(path: string) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://api.football-data.org/v4/${path}`, {
    headers: { "X-Auth-Token": key },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(req: NextRequest) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return NextResponse.json({ configured: false, total: 0, perPlayer: {}, byRound: {} });

  try {
    const { squad } = await req.json();
    if (!Array.isArray(squad)) return NextResponse.json({ error: "squad_required" }, { status: 400 });

    // Refresh TheSportsDB cache (throttled, fetch-once per match) then read aggregates
    await syncResults().catch(() => {});
    const [matchesData, matchEvents] = await Promise.all([
      fetchFootball("competitions/WC/matches?status=FINISHED"),
      getMatchEvents().catch(() => []),
    ]);

    const finished: FinishedMatch[] = (matchesData?.matches ?? [])
      .filter((m: any) => m.score?.fullTime?.home != null)
      .map((m: any) => ({
        tlaHome: m.homeTeam?.tla ?? "",
        tlaAway: m.awayTeam?.tla ?? "",
        scoreHome: m.score.fullTime.home,
        scoreAway: m.score.fullTime.away,
        matchday: m.matchday ?? null,
      }));

    const squadLite: SquadLite[] = squad.map((p: any) => ({
      id: p.id, knownName: p.knownName ?? null, firstName: p.firstName ?? "", lastName: p.lastName ?? "",
      position: p.position, nation: p.nation, isStarting: !!p.isStarting,
      isCaptain: !!p.isCaptain, isViceCaptain: !!p.isViceCaptain,
    }));

    const result = computePoints(squadLite, finished, matchEvents);
    return NextResponse.json({ configured: true, finishedCount: finished.length, detailedMatches: matchEvents.length > 0, ...result });
  } catch {
    return NextResponse.json({ error: "compute_failed", total: 0, perPlayer: {}, byRound: {} }, { status: 500 });
  }
}
