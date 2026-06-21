// Fantasy points — per-player, per-round. Goals/assists/cards attributed to
// the matchday of the specific match (from TheSportsDB events); appearance &
// clean sheets from football-data team results.

export interface FinishedMatch {
  tlaHome: string; tlaAway: string;
  scoreHome: number; scoreAway: number;
  matchday: number | null;
}
export interface CachedEvent {
  type: "goal" | "yellow" | "red";
  player: string; assist: string | null; code: string | null;
  minute: number; penalty: boolean; ownGoal: boolean;
}
export interface MatchEvents { homeCode: string | null; awayCode: string | null; events: CachedEvent[]; }
export interface SquadLite {
  id: number; knownName: string | null; firstName: string; lastName: string;
  position: "GK" | "DEF" | "MID" | "FWD"; nation: string;
  isStarting: boolean; isCaptain: boolean; isViceCaptain: boolean;
}
export interface Breakdown {
  appearance: number; goals: number; assists: number; cleanSheet: number;
  conceded: number; cards: number; ownGoals: number; base: number; total: number; captain: boolean;
}

const GOAL_PTS = { GK: 9, DEF: 7, MID: 6, FWD: 5 } as const;
const ALIAS: Record<string, string> = {};
const aliasEq = (a: string | null, b: string | null) => !!a && !!b && (ALIAS[a] ?? a) === (ALIAS[b] ?? b);
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

function nameMatches(candidate: string, p: SquadLite): boolean {
  const c = norm(candidate);
  const ln = norm(p.lastName), kn = norm(p.knownName ?? ""), full = norm(`${p.firstName} ${p.lastName}`);
  if (ln && (c === ln || c.includes(ln) || ln.includes(c))) return true;
  if (kn && (c === kn || c.includes(kn))) return true;
  if (full && c === full) return true;
  return false;
}

const emptyBd = (captain: boolean): Breakdown =>
  ({ appearance: 0, goals: 0, assists: 0, cleanSheet: 0, conceded: 0, cards: 0, ownGoals: 0, base: 0, total: 0, captain });

const pairKey = (a: string | null, b: string | null) => [a ?? "", b ?? ""].sort().join("|");

export function computePoints(
  squad: SquadLite[], finished: FinishedMatch[], matchEvents: MatchEvents[]
): {
  perPlayer: Record<number, Breakdown>;
  perPlayerRound: Record<number, Record<string, Breakdown>>;
  byRound: Record<string, number>;
  total: number;
} {
  // matchday lookup by team pair (from football-data results)
  const mdByPair = new Map<string, number>();
  for (const m of finished) mdByPair.set(pairKey(m.tlaHome, m.tlaAway), m.matchday ?? 1);

  const perPlayer: Record<number, Breakdown> = {};
  const perPlayerRound: Record<number, Record<string, Breakdown>> = {};
  const byRound: Record<string, number> = {};
  let total = 0;

  for (const p of squad) {
    const rounds: Record<string, Breakdown> = {};
    const round = (md: number) => (rounds[`MD${md}`] ??= emptyBd(p.isCaptain));

    // Appearance + clean sheet + conceded (per finished match the nation played)
    for (const m of finished) {
      const home = aliasEq(m.tlaHome, p.nation), away = aliasEq(m.tlaAway, p.nation);
      if (!home && !away) continue;
      if (!p.isStarting) continue;
      const r = round(m.matchday ?? 1);
      const conceded = home ? m.scoreAway : m.scoreHome;
      r.appearance += 2;
      if (p.position === "GK" || p.position === "DEF") {
        if (conceded === 0) r.cleanSheet += 5; else if (conceded > 1) r.conceded -= conceded - 1;
      } else if (p.position === "MID" && conceded === 0) r.cleanSheet += 1;
    }

    // Goals / assists / cards (per match, attributed to that match's matchday)
    for (const mx of matchEvents) {
      if (!aliasEq(mx.homeCode, p.nation) && !aliasEq(mx.awayCode, p.nation)) continue;
      const md = mdByPair.get(pairKey(mx.homeCode, mx.awayCode)) ?? 1;
      const r = round(md);
      for (const ev of mx.events) {
        if (!aliasEq(ev.code, p.nation)) continue;
        if (ev.type === "goal") {
          if (ev.ownGoal && nameMatches(ev.player, p)) r.ownGoals -= 2;
          else if (nameMatches(ev.player, p)) r.goals += GOAL_PTS[p.position];
          else if (ev.assist && nameMatches(ev.assist, p)) r.assists += 3;
        } else if (ev.type === "yellow" && nameMatches(ev.player, p)) r.cards -= 1;
        else if (ev.type === "red" && nameMatches(ev.player, p)) r.cards -= 2;
      }
    }

    // Finalise each round + cumulative
    const cum = emptyBd(p.isCaptain);
    for (const [rk, b] of Object.entries(rounds)) {
      b.base = b.appearance + b.goals + b.assists + b.cleanSheet + b.conceded + b.cards + b.ownGoals;
      b.total = p.isCaptain ? b.base * 2 : b.base;
      byRound[rk] = (byRound[rk] ?? 0) + b.total;
      cum.appearance += b.appearance; cum.goals += b.goals; cum.assists += b.assists;
      cum.cleanSheet += b.cleanSheet; cum.conceded += b.conceded; cum.cards += b.cards; cum.ownGoals += b.ownGoals;
    }
    cum.base = cum.appearance + cum.goals + cum.assists + cum.cleanSheet + cum.conceded + cum.cards + cum.ownGoals;
    cum.total = p.isCaptain ? cum.base * 2 : cum.base;

    perPlayer[p.id] = cum;
    perPlayerRound[p.id] = rounds;
    total += cum.total;
  }

  return { perPlayer, perPlayerRound, byRound, total };
}
