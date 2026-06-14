// Fantasy points — hybrid: TheSportsDB per-player events (goals, assists,
// cards) + football-data team results (clean sheets, appearances).

export interface FinishedMatch {
  tlaHome: string; tlaAway: string;
  scoreHome: number; scoreAway: number;
  matchday: number | null;
}
export interface ScorerLine { tla: string; name: string; lastName: string; goals: number; assists: number; }
export interface PlayerAgg {
  name: string; code: string | null;
  goals: number; assists: number; yellows: number; reds: number; ownGoals: number;
}
export interface SquadLite {
  id: number; knownName: string | null; firstName: string; lastName: string;
  position: "GK" | "DEF" | "MID" | "FWD"; nation: string;
  isStarting: boolean; isCaptain: boolean; isViceCaptain: boolean;
}
export interface PlayerBreakdown {
  appearance: number; goals: number; assists: number; cleanSheet: number;
  conceded: number; cards: number; ownGoals: number;
  base: number; total: number; captain: boolean;
}

const GOAL_PTS = { GK: 9, DEF: 7, MID: 6, FWD: 5 } as const;
const ALIAS: Record<string, string> = {};
const aliasEq = (a: string, b: string) => (ALIAS[a] ?? a) === (ALIAS[b] ?? b);
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

function nameMatches(candidate: string, p: SquadLite): boolean {
  const c = norm(candidate);
  const ln = norm(p.lastName), kn = norm(p.knownName ?? ""), full = norm(`${p.firstName} ${p.lastName}`);
  if (ln && (c === ln || c.includes(ln) || ln.includes(c))) return true;
  if (kn && (c === kn || c.includes(kn))) return true;
  if (full && c === full) return true;
  return false;
}

export function computePoints(
  squad: SquadLite[], finished: FinishedMatch[], scorers: ScorerLine[], aggs: PlayerAgg[]
): { perPlayer: Record<number, PlayerBreakdown>; total: number; byRound: Record<string, number> } {
  const perPlayer: Record<number, PlayerBreakdown> = {};
  const byRound: Record<string, number> = {};
  let total = 0;

  for (const p of squad) {
    const b: PlayerBreakdown = { appearance: 0, goals: 0, assists: 0, cleanSheet: 0, conceded: 0, cards: 0, ownGoals: 0, base: 0, total: 0, captain: p.isCaptain };
    const myMatches = finished.filter((m) => aliasEq(m.tlaHome, p.nation) || aliasEq(m.tlaAway, p.nation));
    let lastMd = 1;

    for (const m of myMatches) {
      const md = m.matchday ?? 1;
      lastMd = Math.max(lastMd, md);
      const conceded = aliasEq(m.tlaHome, p.nation) ? m.scoreAway : m.scoreHome;
      if (p.isStarting) {
        b.appearance += 2;
        let cs = 0;
        if (p.position === "GK" || p.position === "DEF") {
          if (conceded === 0) cs = 5; else if (conceded > 1) b.conceded -= conceded - 1;
        } else if (p.position === "MID" && conceded === 0) cs = 1;
        b.cleanSheet += cs;
        const rk = `MD${md}`;
        byRound[rk] = (byRound[rk] ?? 0) + (2 + cs + (p.position === "GK" || p.position === "DEF" ? (conceded > 1 ? -(conceded - 1) : 0) : 0)) * (p.isCaptain ? 2 : 1);
      }
    }

    // Goals: max of TheSportsDB per-match sum vs football-data cumulative (avoids double/under count)
    const myAggs = aggs.filter((a) => a.code && aliasEq(a.code, p.nation) && nameMatches(a.name, p));
    const tsdbGoals = myAggs.reduce((s, a) => s + a.goals, 0);
    const fd = scorers.find((s) => aliasEq(s.tla, p.nation) && nameMatches(s.name, p));
    const goals = Math.max(tsdbGoals, fd?.goals ?? 0);
    b.goals = goals * GOAL_PTS[p.position];

    const assists = Math.max(myAggs.reduce((s, a) => s + a.assists, 0), fd?.assists ?? 0);
    b.assists = assists * 3;
    b.cards = myAggs.reduce((s, a) => s - a.yellows - a.reds * 2, 0);
    b.ownGoals = myAggs.reduce((s, a) => s - a.ownGoals * 2, 0);

    const attack = b.goals + b.assists + b.cards + b.ownGoals;
    if (attack !== 0) {
      const rk = `MD${lastMd}`;
      byRound[rk] = (byRound[rk] ?? 0) + attack * (p.isCaptain ? 2 : 1);
    }

    b.base = b.appearance + b.goals + b.assists + b.cleanSheet + b.conceded + b.cards + b.ownGoals;
    b.total = p.isCaptain ? b.base * 2 : b.base;
    perPlayer[p.id] = b;
    total += b.total;
  }

  return { perPlayer, total, byRound };
}
