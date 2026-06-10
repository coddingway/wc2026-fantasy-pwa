import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SquadPlayer, Transfer, Prediction, Badge } from "./types";
import { BOOSTERS } from "./squad-data";
import { POSITION_QUOTA, STARTING_QUOTA, MAX_PER_NATION, BUDGET } from "./nations";

// Pristine state for a brand-new user — NOTHING pre-built.
// They must create their own squad from scratch.
export const INITIAL_FANTASY_STATE = {
  squad: [] as SquadPlayer[],
  budget: BUDGET,
  totalBudget: BUDGET,
  totalPoints: 0,
  roundPoints: {} as Record<string, number>,
  transfers: [] as Transfer[],
  freeTransfersRemaining: 2,
  boosters: BOOSTERS.map((b) => ({ ...b, used: false })),
  predictions: [] as Prediction[],
  badges: [] as Badge[],
  favoriteTeam: null as string | null,
  teamName: "My Team",
  notifications: true,
  darkMode: true,
};

interface FantasyStore {
  // Squad
  squad: SquadPlayer[];
  setSquad: (squad: SquadPlayer[]) => void;
  addPlayer: (p: SquadPlayer) => string | null; // returns error message or null
  removePlayer: (id: number) => void;
  updatePlayer: (id: number, updates: Partial<SquadPlayer>) => void;
  setCaptain: (id: number) => void;
  setViceCaptain: (id: number) => void;
  swapStartingBench: (starterId: number, benchId: number) => void;
  resetAll: () => void;

  // Budget
  budget: number;
  totalBudget: number;
  setBudget: (b: number) => void;

  // Points
  totalPoints: number;
  roundPoints: Record<string, number>;
  addRoundPoints: (round: string, pts: number) => void;

  // Transfers
  transfers: Transfer[];
  addTransfer: (t: Transfer) => void;
  freeTransfersRemaining: number;
  setFreeTransfers: (n: number) => void;

  // Boosters
  boosters: typeof BOOSTERS;
  useBooster: (id: string) => void;

  // Predictions
  predictions: Prediction[];
  addPrediction: (p: Prediction) => void;

  // Badges
  badges: Badge[];
  earnBadge: (id: string) => void;

  // Settings
  favoriteTeam: string | null;
  setFavoriteTeam: (code: string) => void;
  teamName: string;
  setTeamName: (name: string) => void;
  notifications: boolean;
  toggleNotifications: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useFantasyStore = create<FantasyStore>()(
  persist(
    (set, get) => ({
      squad: INITIAL_FANTASY_STATE.squad,
      setSquad: (squad) => set({ squad }),
      addPlayer: (p) => {
        const { squad } = get();
        if (squad.length >= 15) return "Squad is full (15 players)";
        if (squad.some((s) => s.id === p.id)) return "Player already in your squad";
        const posCount = squad.filter((s) => s.position === p.position).length;
        if (posCount >= POSITION_QUOTA[p.position]) return `Max ${POSITION_QUOTA[p.position]} ${p.position}s allowed`;
        const natCount = squad.filter((s) => s.nation === p.nation).length;
        if (natCount >= MAX_PER_NATION) return `Max ${MAX_PER_NATION} players per nation`;
        const spent = squad.reduce((s, x) => s + x.price, 0);
        if (spent + p.price > BUDGET) return `Over budget — $${(BUDGET - spent).toFixed(1)}M left`;
        const startersInPos = squad.filter((s) => s.position === p.position && s.isStarting).length;
        const isStarting = startersInPos < STARTING_QUOTA[p.position];
        let next = [...squad, { ...p, isStarting, isCaptain: false, isViceCaptain: false }];
        if (next.length === 15) {
          // FIFA rule: most expensive = captain, 2nd = vice
          const sorted = [...next].sort((a, b) => b.price - a.price);
          next = next.map((x) => ({
            ...x, isCaptain: x.id === sorted[0].id, isViceCaptain: x.id === sorted[1].id,
          }));
        }
        set({ squad: next });
        return null;
      },
      removePlayer: (id) => set((s) => ({ squad: s.squad.filter((p) => p.id !== id) })),
      resetAll: () => set({ ...INITIAL_FANTASY_STATE }),
      updatePlayer: (id, updates) =>
        set((s) => ({ squad: s.squad.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      setCaptain: (id) =>
        set((s) => ({
          squad: s.squad.map((p) => ({ ...p, isCaptain: p.id === id, isViceCaptain: p.isViceCaptain && p.id !== id })),
        })),
      setViceCaptain: (id) =>
        set((s) => ({
          squad: s.squad.map((p) => ({ ...p, isViceCaptain: p.id === id, isCaptain: p.isCaptain && p.id !== id })),
        })),
      swapStartingBench: (starterId, benchId) =>
        set((s) => ({
          squad: s.squad.map((p) => {
            if (p.id === starterId) return { ...p, isStarting: false };
            if (p.id === benchId) return { ...p, isStarting: true };
            return p;
          }),
        })),

      budget: 100,
      totalBudget: 100,
      setBudget: (budget) => set({ budget }),

      totalPoints: 0,
      roundPoints: {},
      addRoundPoints: (round, pts) =>
        set((s) => ({
          totalPoints: s.totalPoints + pts,
          roundPoints: { ...s.roundPoints, [round]: pts },
        })),

      transfers: [],
      addTransfer: (t) => set((s) => ({ transfers: [...s.transfers, t] })),
      freeTransfersRemaining: 2,
      setFreeTransfers: (n) => set({ freeTransfersRemaining: n }),

      boosters: BOOSTERS,
      useBooster: (id) =>
        set((s) => ({ boosters: s.boosters.map((b) => (b.id === id ? { ...b, used: true } : b)) })),

      predictions: [],
      addPrediction: (p) => set((s) => ({ predictions: [...s.predictions, p] })),

      badges: [],
      earnBadge: (id) =>
        set((s) => ({
          badges: s.badges.find((b) => b.id === id)
            ? s.badges
            : [...s.badges, { id, name: id, description: "", icon: "🏅", earned: true, earnedDate: new Date().toISOString() }],
        })),

      favoriteTeam: null,
      setFavoriteTeam: (favoriteTeam) => set({ favoriteTeam }),
      teamName: INITIAL_FANTASY_STATE.teamName,
      setTeamName: (teamName) => set({ teamName }),
      notifications: true,
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "wc2026-fantasy-store" }
  )
);
