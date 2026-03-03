import { getSeasons } from "../api/seasonApi";
import type { Season } from "../types";
import { create } from "zustand";

interface SeasonState {
  seasons: Season[];
  isLoading: boolean;
  loadPromise: Promise<void> | null;
  loadSeasons: () => Promise<void>;
  getLatestSeason: () => Season | null;
  getLatestSeasonValue: () => string | undefined;
}

export const useSeasonStore = create<SeasonState>((set, get) => ({
  seasons: [],
  isLoading: false,
  loadPromise: null,

  getLatestSeason: () => {
    const { seasons } = get();
    if (seasons.length === 0) return null;
    return seasons.reduce((latest, s) =>
      s.seasonValue > latest.seasonValue ? s : latest
    );
  },

  getLatestSeasonValue: () => {
    const latest = get().getLatestSeason();
    return latest ? String(latest.seasonValue) : undefined;
  },

  loadSeasons: async () => {
    const state = get();

    if (state.seasons.length > 0) {
      return;
    }

    if (state.loadPromise) {
      return state.loadPromise;
    }

    const loadPromise = (async () => {
      set({ isLoading: true });
      try {
        const seasons = await getSeasons();
        set({ seasons, isLoading: false, loadPromise: null });
      } catch (error) {
        console.error("Failed to load seasons:", error);
        set({ isLoading: false, loadPromise: null });
      }
    })();

    set({ loadPromise });
    return loadPromise;
  },
}));
