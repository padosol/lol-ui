import { create } from "zustand";
import type {
  ChampionData,
  ChampionJson,
  SummonerSpellData,
  SummonerJson,
  ItemJson,
  RuneReforgedRune,
  RuneReforgedTree,
  RuneReforgedData,
} from "./types";

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

    if (state.championData) {
      return;
    }

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

    if (state.summonerData) {
      return;
    }

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

    if (state.itemData) {
      return;
    }

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

    if (state.runeData) {
      return;
    }

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
