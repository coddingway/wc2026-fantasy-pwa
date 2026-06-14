import { NextRequest, NextResponse } from "next/server";
import { computePoints, FinishedMatch, ScorerLine, SquadLite } from "@/lib/points-engine";

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

    const [matchesData, scorersData] = await Promise.all([
      fetchFootball("competitions/WC/matches?status=FINISHED"),
      fetchFootball("competitions/WC/scorers?limit=100"),
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

    const scorers: ScorerLine[] = (scorersData?.scorers ?? []).map((s: any) => ({
      tla: s.team?.tla ?? "",
      name: s.player?.name ?? "",
      lastName: s.player?.lastName ?? "",
      goals: s.goals ?? 0,
      assists: s.assists ?? 0,
    }));

    const squadLite: SquadLite[] = squad.map((p: any) => ({
      id: p.id, knownName: p.knownName ?? null, firstName: p.firstName ?? "", lastName: p.lastName ?? "",
      position: p.position, nation: p.nation, isStarting: !!p.isStarting,
      isCaptain: !!p.isCaptain, isViceCaptain: !!p.isViceCaptain,
    }));

    const result = computePoints(squadLite, finished, scorers);
    return NextResponse.json({ configured: true, finishedCount: finished.length, ...result });
  } catch {
    return NextResponse.json({ error: "compute_failed", total: 0, perPlayer: {}, byRound: {} }, { status: 500 });
  }
}
