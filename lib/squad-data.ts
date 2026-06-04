import { SquadPlayer } from "./types";

export const NATION_FLAGS: Record<string, string> = {
  BEL: "🇧🇪", ARG: "🇦🇷", GER: "🇩🇪", NED: "🇳🇱", FRA: "🇫🇷",
  BRA: "🇧🇷", MAR: "🇲🇦", ESP: "🇪🇸", POR: "🇵🇹", COL: "🇨🇴",
  TUR: "🇹🇷", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", MEX: "🇲🇽", JPN: "🇯🇵", CRO: "🇭🇷",
  USA: "🇺🇸", SEN: "🇸🇳", URU: "🇺🇾", SUI: "🇨🇭", NOR: "🇳🇴",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", DEN: "🇩🇰", AUT: "🇦🇹", KOR: "🇰🇷", JOR: "🇯🇴",
};

export const SQUAD: SquadPlayer[] = [
  // STARTERS
  { id: 1, firstName: "Thibaut", lastName: "Courtois", knownName: "Courtois", squadId: 5, position: "GK", price: 4.9, status: "playing", percentSelected: 11.9, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "BEL", flag: "🇧🇪" },
  { id: 2, firstName: "Joshua", lastName: "Kimmich", knownName: "Kimmich", squadId: 20, position: "DEF", price: 5.5, status: "playing", percentSelected: 27.7, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "GER", flag: "🇩🇪" },
  { id: 3, firstName: "Virgil", lastName: "van Dijk", knownName: "Van Dijk", squadId: 30, position: "DEF", price: 5.5, status: "playing", percentSelected: 20.7, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "NED", flag: "🇳🇱" },
  { id: 4, firstName: "William", lastName: "Saliba", knownName: "Saliba", squadId: 19, position: "DEF", price: 5.3, status: "playing", percentSelected: 15.8, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "FRA", flag: "🇫🇷" },
  { id: 5, firstName: "Gabriel", lastName: "Magalhães", knownName: "Gabriel", squadId: 7, position: "DEF", price: 5.5, status: "playing", percentSelected: 25.2, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "BRA", flag: "🇧🇷" },
  { id: 6, firstName: "Lamine", lastName: "Yamal", knownName: "Lamine Yamal", squadId: 41, position: "MID", price: 10.0, status: "playing", percentSelected: 44.3, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: true, nation: "ESP", flag: "🇪🇸" },
  { id: 7, firstName: "Bruno", lastName: "Fernandes", knownName: "Bruno Fernandes", squadId: 35, position: "MID", price: 8.5, status: "playing", percentSelected: 48.8, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "POR", flag: "🇵🇹" },
  { id: 8, firstName: "Luis", lastName: "Díaz", knownName: "Luis Díaz", squadId: 10, position: "MID", price: 8.1, status: "playing", percentSelected: 18.8, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "COL", flag: "🇨🇴" },
  { id: 9, firstName: "Arda", lastName: "Güler", knownName: "Arda Güler", squadId: 45, position: "MID", price: 7.0, status: "playing", percentSelected: 8.6, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "TUR", flag: "🇹🇷" },
  { id: 10, firstName: "Harry", lastName: "Kane", knownName: "Harry Kane", squadId: 18, position: "FWD", price: 10.5, status: "playing", percentSelected: 37.9, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: true, isViceCaptain: false, nation: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 11, firstName: "Julián", lastName: "Álvarez", knownName: "Julián Álvarez", squadId: 2, position: "FWD", price: 8.6, status: "playing", percentSelected: 16.2, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: true, isCaptain: false, isViceCaptain: false, nation: "ARG", flag: "🇦🇷" },
  // BENCH
  { id: 12, firstName: "Guillermo", lastName: "Ochoa", knownName: "Ochoa", squadId: 28, position: "GK", price: 4.2, status: "playing", percentSelected: 2.0, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: false, isCaptain: false, isViceCaptain: false, nation: "MEX", flag: "🇲🇽" },
  { id: 13, firstName: "Achraf", lastName: "Hakimi", knownName: "Hakimi", squadId: 29, position: "DEF", price: 6.0, status: "playing", percentSelected: 21.1, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: false, isCaptain: false, isViceCaptain: false, nation: "MAR", flag: "🇲🇦" },
  { id: 14, firstName: "Daizen", lastName: "Maeda", knownName: "Daizen Maeda", squadId: 25, position: "MID", price: 5.0, status: "playing", percentSelected: 1.2, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: false, isCaptain: false, isViceCaptain: false, nation: "JPN", flag: "🇯🇵" },
  { id: 15, firstName: "Ivan", lastName: "Perišić", knownName: "Ivan Perišić", squadId: 13, position: "FWD", price: 5.4, status: "playing", percentSelected: 0.5, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 }, oneToWatch: false, isStarting: false, isCaptain: false, isViceCaptain: false, nation: "CRO", flag: "🇭🇷" },
];

export const ROUNDS = [
  { id: "md1", name: "Group Stage MD1", date: "2026-06-11", freeTransfers: 0, budgetBoost: 0, countryLimit: 3 },
  { id: "md2", name: "Group Stage MD2", date: "2026-06-17", freeTransfers: 2, budgetBoost: 0, countryLimit: 3 },
  { id: "md3", name: "Group Stage MD3", date: "2026-06-22", freeTransfers: 2, budgetBoost: 0, countryLimit: 3 },
  { id: "r32", name: "Round of 32", date: "2026-07-01", freeTransfers: 99, budgetBoost: 5, countryLimit: 3 },
  { id: "r16", name: "Round of 16", date: "2026-07-08", freeTransfers: 4, budgetBoost: 0, countryLimit: 4 },
  { id: "qf",  name: "Quarter-Finals", date: "2026-07-14", freeTransfers: 4, budgetBoost: 0, countryLimit: 5 },
  { id: "sf",  name: "Semi-Finals", date: "2026-07-18", freeTransfers: 5, budgetBoost: 0, countryLimit: 6 },
  { id: "f",   name: "The Final", date: "2026-07-21", freeTransfers: 6, budgetBoost: 0, countryLimit: 8 },
];

export const BOOSTERS = [
  { id: "wildcard", name: "Wildcard", icon: "🃏", description: "Unlimited transfers for one round", used: false, recommended: "Round of 32" },
  { id: "12thman", name: "12th Man", icon: "👤", description: "Add 1 extra player outside budget", used: false, recommended: "Semi-Finals" },
  { id: "maxcaptain", name: "Max Captain", icon: "⭐", description: "Auto-captain your top scorer", used: false, recommended: "Quarter-Finals" },
  { id: "qualification", name: "Qualification Booster", icon: "🏅", description: "+2pts per starter who advances", used: false, recommended: "Round of 16" },
  { id: "mystery", name: "Mystery Booster", icon: "❓", description: "Revealed at Round of 32", used: false, recommended: "TBD" },
];

export const SCORING = {
  appearance60: 1,
  appearance60plus: 2,
  assist: 3,
  yellowCard: -1,
  redCard: -2,
  ownGoal: -2,
  winningPenalty: 2,
  concedingPenalty: -1,
  GK: { cleanSheet: 5, goalScored: 9, penaltySave: 3, savesBonus: 1 },
  DEF: { cleanSheet: 5, goalScored: 7, goalsConcededMinus: -1 },
  MID: { cleanSheet: 1, goalScored: 6, tacklesBonus: 1, chancesBonus: 1 },
  FWD: { goalScored: 5, shotsBonus: 1 },
  bonus: { freeKickGoal: 1, scoutingBonus: 2 },
};
