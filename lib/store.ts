import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SquadPlayer, Transfer, Prediction, Badge } from "./types";
import { SQUAD, BOOSTERS } from "./squad-data";

interface FantasyStore {
  // Squad
  squad: SquadPlayer[];
  setSquad: (squad: SquadPlayer[]) => void;
  updatePlayer: (id: number, updates: Partial<SquadPlayer>) => void;
  setCaptain: (id: number) => void;
  setViceCaptain: (id: number) => void;
  swapStartingBench: (starterId: number, benchId: number) => void;

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
      squad: SQUAD,
      setSquad: (squad) => set({ squad }),
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

      teamName: "Grove Street FC",
      setTeamName: (teamName) => set({ teamName }),
      notifications: true,
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "wc2026-fantasy-store" }
  )
);
