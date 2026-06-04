export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  knownName: string | null;
  squadId: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  price: number;
  status: string;
  percentSelected: number;
  stats: {
    totalPoints: number;
    avgPoints: number;
    form: number;
    lastRoundPoints: number;
  };
  oneToWatch: boolean;
}

export interface SquadPlayer extends Player {
  isStarting: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  nation: string;
  flag: string;
}

export interface Transfer {
  out: SquadPlayer;
  in: Player;
  round: string;
  date: string;
  pointsGained?: number;
}

export interface Round {
  id: string;
  name: string;
  date: string;
  freeTransfers: number;
  budgetBoost: number;
  countryLimit: number;
}

export interface Fixture {
  homeTeam: string;
  awayTeam: string;
  date: string;
  difficulty: "easy" | "medium" | "hard";
  round: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface LeagueMember {
  rank: number;
  name: string;
  points: number;
  lastRound: number;
  teamName: string;
}

export interface Prediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  firstScorer: string;
  correct?: boolean;
  points?: number;
}
