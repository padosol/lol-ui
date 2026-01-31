import { create } from "zustand";

interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
}

interface ChampionJson {
  data: {
    [key: string]: ChampionData;
  };
}

interface SummonerSpellData {
  id: string;
  key: string;
  name: string;
  description?: string;
  cooldown?: number[];
  image?: {
    full: string;
  };
  [key: string]: string | number | number[] | { full: string } | undefined;
}

interface SummonerJson {
  type: string;
  version: string;
  data: {
    [key: string]: SummonerSpellData;
  };
}

interface GameDataState {
  championData: ChampionJson | null;
  summonerData: SummonerJson | null;
  isLoadingChampion: boolean;
  isLoadingSummoner: boolean;
  championLoadPromise: Promise<void> | null;
  summonerLoadPromise: Promise<void> | null;
  loadChampionData: () => Promise<void>;
  loadSummonerData: () => Promise<void>;
}

export const useGameDataStore = create<GameDataState>((set, get) => ({
  championData: null,
  summonerData: null,
  isLoadingChampion: false,
  isLoadingSummoner: false,
  championLoadPromise: null,
  summonerLoadPromise: null,

  loadChampionData: async () => {
    const state = get();

    // 이미 로드되었으면 스킵
    if (state.championData) {
      return;
    }

    // 이미 로딩 중이면 기존 Promise 반환
    if (state.championLoadPromise) {
      return state.championLoadPromise;
    }

    const loadPromise = (async () => {
      set({ isLoadingChampion: true });
      try {
        const response = await fetch("/data/champion.json");
        const data = (await response.json()) as ChampionJson;
        set({ championData: data, isLoadingChampion: false, championLoadPromise: null });
      } catch (error) {
        console.error("Failed to load champion data:", error);
        set({ isLoadingChampion: false, championLoadPromise: null });
      }
    })();

    set({ championLoadPromise: loadPromise });
    return loadPromise;
  },

  loadSummonerData: async () => {
    const state = get();

    // 이미 로드되었으면 스킵
    if (state.summonerData) {
      return;
    }

    // 이미 로딩 중이면 기존 Promise 반환
    if (state.summonerLoadPromise) {
      return state.summonerLoadPromise;
    }

    const loadPromise = (async () => {
      set({ isLoadingSummoner: true });
      try {
        const response = await fetch("/data/summoner.json");
        const data = (await response.json()) as SummonerJson;
        set({ summonerData: data, isLoadingSummoner: false, summonerLoadPromise: null });
      } catch (error) {
        console.error("Failed to load summoner data:", error);
        set({ isLoadingSummoner: false, summonerLoadPromise: null });
      }
    })();

    set({ summonerLoadPromise: loadPromise });
    return loadPromise;
  },
}));

// 타입 export
export type { ChampionData, ChampionJson, SummonerSpellData, SummonerJson };

