import { create } from "zustand";

interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
  info?: ChampionInfo;
  tags?: string[];
  stats?: ChampionStats;
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

interface ItemJsonData {
  name: string;
  description: string;
  plaintext?: string;
  image: {
    full: string;
    sprite?: string;
    group?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  };
  gold: {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  };
  tags: string[];
  maps: { [key: string]: boolean };
  stats?: { [key: string]: number };
  into?: string[];
  from?: string[];
  colloq?: string;
}

interface ItemJson {
  type: string;
  version: string;
  data: {
    [key: string]: ItemJsonData;
  };
}

interface GameDataState {
  championData: ChampionJson | null;
  summonerData: SummonerJson | null;
  itemData: ItemJson | null;
  isLoadingChampion: boolean;
  isLoadingSummoner: boolean;
  isLoadingItem: boolean;
  championLoadPromise: Promise<void> | null;
  summonerLoadPromise: Promise<void> | null;
  itemLoadPromise: Promise<void> | null;
  loadChampionData: () => Promise<void>;
  loadSummonerData: () => Promise<void>;
  loadItemData: () => Promise<void>;
}

export const useGameDataStore = create<GameDataState>((set, get) => ({
  championData: null,
  summonerData: null,
  itemData: null,
  isLoadingChampion: false,
  isLoadingSummoner: false,
  isLoadingItem: false,
  championLoadPromise: null,
  summonerLoadPromise: null,
  itemLoadPromise: null,

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
  loadItemData: async () => {
    const state = get();

    // 이미 로드되었으면 스킵
    if (state.itemData) {
      return;
    }

    // 이미 로딩 중이면 기존 Promise 반환
    if (state.itemLoadPromise) {
      return state.itemLoadPromise;
    }

    const loadPromise = (async () => {
      set({ isLoadingItem: true });
      try {
        const response = await fetch("/data/item.json");
        const data = (await response.json()) as ItemJson;
        set({ itemData: data, isLoadingItem: false, itemLoadPromise: null });
      } catch (error) {
        console.error("Failed to load item data:", error);
        set({ isLoadingItem: false, itemLoadPromise: null });
      }
    })();

    set({ itemLoadPromise: loadPromise });
    return loadPromise;
  },
}));

// 타입 export
export type { ChampionData, ChampionInfo, ChampionStats, ChampionJson, SummonerSpellData, SummonerJson, ItemJsonData, ItemJson };

