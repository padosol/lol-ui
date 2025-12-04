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
  [key: string]: any;
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
  loadChampionData: () => Promise<void>;
  loadSummonerData: () => Promise<void>;
}

export const useGameDataStore = create<GameDataState>((set, get) => ({
  championData: null,
  summonerData: null,
  isLoadingChampion: false,
  isLoadingSummoner: false,

  loadChampionData: async () => {
    const state = get();
    // 이미 로드되었거나 로딩 중이면 스킵
    if (state.championData || state.isLoadingChampion) {
      return;
    }

    set({ isLoadingChampion: true });
    try {
      const response = await fetch("/data/champion.json");
      const data = (await response.json()) as ChampionJson;
      set({ championData: data, isLoadingChampion: false });
    } catch (error) {
      console.error("Failed to load champion data:", error);
      set({ isLoadingChampion: false });
    }
  },

  loadSummonerData: async () => {
    const state = get();
    // 이미 로드되었거나 로딩 중이면 스킵
    if (state.summonerData || state.isLoadingSummoner) {
      return;
    }

    set({ isLoadingSummoner: true });
    try {
      const response = await fetch("/data/summoner.json");
      const data = (await response.json()) as SummonerJson;
      set({ summonerData: data, isLoadingSummoner: false });
    } catch (error) {
      console.error("Failed to load summoner data:", error);
      set({ isLoadingSummoner: false });
    }
  },
}));

// 타입 export
export type { ChampionData, ChampionJson, SummonerSpellData, SummonerJson };

