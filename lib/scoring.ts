// FIFA WC2026 Fantasy scoring engine — pure functions, mirrors official rules.

export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface MatchPerformance {
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  penaltiesWon: number;
  penaltiesConceded: number;
  goalsConceded: number;   // while on pitch (GK/DEF/MID clean-sheet logic)
  saves: number;           // GK
  penaltySaves: number;    // GK, excl. shootouts
  tackles: number;         // MID
  chancesCreated: number;  // MID
  shotsOnTarget: number;   // FWD
  directFreeKickGoals: number;
  ownershipPercent: number; // for scouting bonus
}

export const EMPTY_PERF: MatchPerformance = {
  minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, ownGoals: 0,
  penaltiesWon: 0, penaltiesConceded: 0, goalsConceded: 0, saves: 0,
  penaltySaves: 0, tackles: 0, chancesCreated: 0, shotsOnTarget: 0,
  directFreeKickGoals: 0, ownershipPercent: 100,
};

const GOAL_POINTS: Record<Position, number> = { GK: 9, DEF: 7, MID: 6, FWD: 5 };

export function calculatePoints(pos: Position, p: MatchPerformance): number {
  if (p.minutes <= 0) return 0;
  let pts = 0;

  // Appearance
  pts += 1;
  if (p.minutes >= 60) pts += 1;

  // Universal
  pts += p.goals * GOAL_POINTS[pos];
  pts += p.assists * 3;
  pts -= p.yellowCards * 1;
  pts -= p.redCards * 2;
  pts -= p.ownGoals * 2;
  pts += p.penaltiesWon * 2;
  pts -= p.penaltiesConceded * 1;

  // Clean sheet / conceded
  if (pos === "GK" || pos === "DEF") {
    if (p.goalsConceded === 0 && p.minutes >= 60) pts += 5;
    if (p.goalsConceded > 1) pts -= (p.goalsConceded - 1); // first conceded = 0
  }
  if (pos === "MID" && p.goalsConceded === 0 && p.minutes >= 60) pts += 1;

  // Position specifics
  if (pos === "GK") {
    pts += p.penaltySaves * 3;
    pts += Math.floor(p.saves / 3);
  }
  if (pos === "MID") {
    pts += Math.floor(p.tackles / 3);
    pts += Math.floor(p.chancesCreated / 2);
  }
  if (pos === "FWD") {
    pts += Math.floor(p.shotsOnTarget / 2);
  }

  // Bonuses
  pts += p.directFreeKickGoals * 1; // on top of goal points
  if (pts > 4 && p.ownershipPercent < 5) pts += 2; // scouting bonus

  return pts;
}

export function captainPoints(base: number): number {
  return base * 2;
}

// Settle a score prediction: +5 exact score, +2 correct result
export function settlePrediction(
  predHome: number, predAway: number,
  actualHome: number, actualAway: number
): number {
  if (predHome === actualHome && predAway === actualAway) return 5;
  const predResult = Math.sign(predHome - predAway);
  const actualResult = Math.sign(actualHome - actualAway);
  return predResult === actualResult ? 2 : 0;
}
