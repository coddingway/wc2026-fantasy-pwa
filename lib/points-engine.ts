// Fantasy points from official data (free tier: goals + results only).
// Honest approximation: goals from the official scorers feed, plus
// appearance + clean-sheet for STARTERS based on team results.
// Minutes/cards/assists detail isn't in the free feed, so these are
// labelled as estimated.

export interface FinishedMatch {
  tlaHome: string; tlaAway: string;
  scoreHome: number; scoreAway: number;
  matchday: number | null;
}
export interface ScorerLine {
  tla: string; name: string; lastName: string;
  goals: number; assists: number;
}
export interface SquadLite {
  id: number; knownName: string | null; firstName: string; lastName: string;
  position: "GK" | "DEF" | "MID" | "FWD"; nation: string;
  isStarting: boolean; isCaptain: boolean; isViceCaptain: boolean;
}

export interface PlayerBreakdown {
  appearance: number; goals: number; cleanSheet: number;
  conceded: number; assists: number; base: number; total: number; captain: boolean;
}

const GOAL_PTS = { GK: 9, DEF: 7, MID: 6, FWD: 5 } as const;

// Nation-code aliases (our codes vs API TLAs) — add only when they differ.
const ALIAS: Record<string, string> = { /* codes already align */ };
const aliasEq = (a: string, b: string) => (ALIAS[a] ?? a) === (ALIAS[b] ?? b);

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

function isScorer(s: ScorerLine, p: SquadLite): boolean {
  if (!aliasEq(s.tla, p.nation)) return false;
  const ln = norm(p.lastName);
  const kn = norm(p.knownName ?? "");
  const full = norm(`${p.firstName} ${p.lastName}`);
  const sName = norm(s.name);
  const sLast = norm(s.lastName);
  if (ln && (sLast === ln || sName.includes(ln))) return true;
  if (kn && (sName === kn || sName.includes(kn))) return true;
  if (full && sName === full) return true;
  return false;
}

export function computePoints(
  squad: SquadLite[], finished: FinishedMatch[], scorers: ScorerLine[]
): { perPlayer: Record<number, PlayerBreakdown>; total: number; byRound: Record<string, number> } {
  const perPlayer: Record<number, PlayerBreakdown> = {};
  const byRound: Record<string, number> = {};
  let total = 0;

  for (const p of squad) {
    const b: PlayerBreakdown = { appearance: 0, goals: 0, cleanSheet: 0, conceded: 0, assists: 0, base: 0, total: 0, captain: p.isCaptain };
    const myMatches = finished.filter((m) => aliasEq(m.tlaHome, p.nation) || aliasEq(m.tlaAway, p.nation));
    let lastMd = 1;

    for (const m of myMatches) {
      const md = m.matchday ?? 1;
      lastMd = Math.max(lastMd, md);
      const conceded = aliasEq(m.tlaHome, p.nation) ? m.scoreAway : m.scoreHome;
      if (p.isStarting) {
        b.appearance += 2; // assume 60+ for starters
        if (p.position === "GK" || p.position === "DEF") {
          if (conceded === 0) b.cleanSheet += 5;
          else if (conceded > 1) b.conceded -= conceded - 1;
        } else if (p.position === "MID" && conceded === 0) {
          b.cleanSheet += 1;
        }
        const rk = `MD${md}`;
        byRound[rk] = (byRound[rk] ?? 0) + 2 + (p.position === "GK" || p.position === "DEF" ? (conceded === 0 ? 5 : conceded > 1 ? -(conceded - 1) : 0) : p.position === "MID" && conceded === 0 ? 1 : 0);
      }
    }

    const sc = scorers.find((s) => isScorer(s, p));
    if (sc) {
      const gp = sc.goals * GOAL_PTS[p.position];
      b.goals = gp;
      b.assists = (sc.assists ?? 0) * 3;
      const rk = `MD${lastMd}`;
      byRound[rk] = (byRound[rk] ?? 0) + (gp + b.assists) * (p.isCaptain ? 2 : 1);
    }

    b.base = b.appearance + b.goals + b.cleanSheet + b.conceded + b.assists;
    b.total = p.isCaptain ? b.base * 2 : b.base;
    perPlayer[p.id] = b;
    total += b.total;
  }

  return { perPlayer, total, byRound };
}
