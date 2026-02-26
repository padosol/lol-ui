import { getSeasons } from "@/lib/api/season";
import type { Season } from "@/types/api";
import { create } from "zustand";

interface SeasonState {
  seasons: Season[];
  isLoading: boolean;
  loadPromise: Promise<void> | null;
  loadSeasons: () => Promise<void>;
}

export const useSeasonStore = create<SeasonState>((set, get) => ({
  seasons: [],
  isLoading: false,
  loadPromise: null,

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
