import { getSeasons } from "../api/seasonApi";
import { pickLatestPatchVersion } from "../lib/patchVersion";
import type { Season } from "../types";
import { create } from "zustand";

interface SeasonState {
  seasons: Season[];
  isLoading: boolean;
  loadPromise: Promise<void> | null;
  loadSeasons: () => Promise<void>;
  getLatestSeason: () => Season | null;
  getLatestSeasonValue: () => string | undefined;
  getLatestPatchVersion: () => string | null;
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

  /** 최신 시즌의 패치 목록에서 가장 높은 버전. 게임 정적 데이터 경로에 쓰인다. */
  getLatestPatchVersion: () => {
    const latest = get().getLatestSeason();
    return pickLatestPatchVersion(latest?.patchVersions);
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
