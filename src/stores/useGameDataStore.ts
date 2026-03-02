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

interface ChampionSpellData {
  id: string;
  name: string;
  description: string;
  maxrank: number;
  cooldownBurn: string;
  costBurn: string;
  resource: string;
  image: { full: string };
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
  spells?: ChampionSpellData[];
  passive?: { name: string; description: string; image: { full: string } };
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

interface RuneReforgedRune {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
}

interface RuneReforgedSlot {
  runes: RuneReforgedRune[];
}

interface RuneReforgedTree {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: RuneReforgedSlot[];
}

type RuneReforgedData = RuneReforgedTree[];

interface GameDataState {
  championData: ChampionJson | null;
  summonerData: SummonerJson | null;
  itemData: ItemJson | null;
  runeData: RuneReforgedData | null;
  isLoadingChampion: boolean;
  isLoadingSummoner: boolean;
  isLoadingItem: boolean;
  isLoadingRune: boolean;
  championLoadPromise: Promise<void> | null;
  summonerLoadPromise: Promise<void> | null;
  itemLoadPromise: Promise<void> | null;
  runeLoadPromise: Promise<void> | null;
  loadChampionData: () => Promise<void>;
  loadSummonerData: () => Promise<void>;
  loadItemData: () => Promise<void>;
  loadRuneData: () => Promise<void>;
  getSpellByNumericId: (id: number) => SummonerSpellData | undefined;
  getRuneById: (id: number) => RuneReforgedRune | undefined;
  getRuneTreeById: (id: number) => RuneReforgedTree | undefined;
}

export const useGameDataStore = create<GameDataState>((set, get) => ({
  championData: null,
  summonerData: null,
  itemData: null,
  runeData: null,
  isLoadingChampion: false,
  isLoadingSummoner: false,
  isLoadingItem: false,
  isLoadingRune: false,
  championLoadPromise: null,
  summonerLoadPromise: null,
  itemLoadPromise: null,
  runeLoadPromise: null,

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
        const response = await fetch("/data/championFull.json");
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

  loadRuneData: async () => {
    const state = get();

    // 이미 로드되었으면 스킵
    if (state.runeData) {
      return;
    }

    // 이미 로딩 중이면 기존 Promise 반환
    if (state.runeLoadPromise) {
      return state.runeLoadPromise;
    }

    const loadPromise = (async () => {
      set({ isLoadingRune: true });
      try {
        const response = await fetch("/data/runesReforged.json");
        const data = (await response.json()) as RuneReforgedData;
        set({ runeData: data, isLoadingRune: false, runeLoadPromise: null });
      } catch (error) {
        console.error("Failed to load rune data:", error);
        set({ isLoadingRune: false, runeLoadPromise: null });
      }
    })();

    set({ runeLoadPromise: loadPromise });
    return loadPromise;
  },

  getSpellByNumericId: (id: number) => {
    const { summonerData } = get();
    if (!summonerData) return undefined;
    const key = String(id);
    return Object.values(summonerData.data).find((s) => s.key === key);
  },

  getRuneById: (id: number) => {
    const { runeData } = get();
    if (!runeData) return undefined;
    for (const tree of runeData) {
      for (const slot of tree.slots) {
        const rune = slot.runes.find((r) => r.id === id);
        if (rune) return rune;
      }
    }
    return undefined;
  },

  getRuneTreeById: (id: number) => {
    const { runeData } = get();
    if (!runeData) return undefined;
    return runeData.find((tree) => tree.id === id);
  },
}));

// 타입 export
export type { ChampionData, ChampionInfo, ChampionStats, ChampionJson, ChampionSpellData, SummonerSpellData, SummonerJson, ItemJsonData, ItemJson, RuneReforgedRune, RuneReforgedSlot, RuneReforgedTree, RuneReforgedData };

