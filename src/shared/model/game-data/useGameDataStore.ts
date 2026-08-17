import { create } from "zustand";
import {
  GAME_DATA_FILES,
  gameDataUrl,
  localGameDataUrl,
  type GameDataFile,
} from "@/shared/config/game-data";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import type {
  ChampionJson,
  SummonerSpellData,
  SummonerJson,
  ItemJson,
  RuneReforgedRune,
  RuneReforgedTree,
  RuneReforgedData,
} from "./types";

interface GameDataState {
  /** 현재 데이터를 받아오는 기준 패치. null 이면 번들된 `public/data` 를 쓴다. */
  patchVersion: string | null;
  locale: Locale;
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
  /** 각 데이터가 어떤 (패치, 언어) 조합으로 채워졌는지 — 컨텍스트가 바뀌면 다시 받는다. */
  championLoadedKey: string | null;
  summonerLoadedKey: string | null;
  itemLoadedKey: string | null;
  runeLoadedKey: string | null;
  setGameDataContext: (patchVersion: string | null, locale: Locale) => void;
  loadChampionData: () => Promise<void>;
  loadSummonerData: () => Promise<void>;
  loadItemData: () => Promise<void>;
  loadRuneData: () => Promise<void>;
  getSpellByNumericId: (id: number) => SummonerSpellData | undefined;
  getRuneById: (id: number) => RuneReforgedRune | undefined;
  getRuneTreeById: (id: number) => RuneReforgedTree | undefined;
}

function contextKey(patchVersion: string | null, locale: Locale): string {
  return `${patchVersion ?? "bundled"}|${locale}`;
}

/**
 * CDN(`static.metapick.me/data/{패치}/{로케일}/…`)에서 받아오고,
 * 해당 패치/언어 파일이 아직 없으면 번들된 `public/data` 로 떨어진다.
 */
async function fetchGameData<T>(
  file: GameDataFile,
  patchVersion: string | null,
  locale: Locale
): Promise<T> {
  const url = gameDataUrl(file, patchVersion, locale);

  try {
    return await fetchJson<T>(url);
  } catch (error) {
    const fallbackUrl = localGameDataUrl(file);
    if (url === fallbackUrl) throw error;

    console.warn(`Failed to load ${url}, falling back to ${fallbackUrl}:`, error);
    return fetchJson<T>(fallbackUrl);
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

type LoaderFields = {
  data: "championData" | "summonerData" | "itemData" | "runeData";
  loading: "isLoadingChampion" | "isLoadingSummoner" | "isLoadingItem" | "isLoadingRune";
  promise:
    | "championLoadPromise"
    | "summonerLoadPromise"
    | "itemLoadPromise"
    | "runeLoadPromise";
  loadedKey:
    | "championLoadedKey"
    | "summonerLoadedKey"
    | "itemLoadedKey"
    | "runeLoadedKey";
  file: GameDataFile;
  label: string;
};

type SetState = (partial: Partial<GameDataState>) => void;
type GetState = () => GameDataState;

function createLoader<T>(set: SetState, get: GetState, fields: LoaderFields) {
  return async (): Promise<void> => {
    const state = get();
    const key = contextKey(state.patchVersion, state.locale);

    if (state[fields.loadedKey] === key) {
      return;
    }

    const inflight = state[fields.promise];
    if (inflight) {
      return inflight;
    }

    const loadPromise = (async () => {
      set({ [fields.loading]: true } as Partial<GameDataState>);
      try {
        const data = await fetchGameData<T>(fields.file, state.patchVersion, state.locale);

        // 로딩 중 언어/패치가 바뀌었다면 늦게 도착한 응답이므로 버린다
        const current = get();
        if (contextKey(current.patchVersion, current.locale) !== key) {
          set({ [fields.loading]: false, [fields.promise]: null } as Partial<GameDataState>);
          return;
        }

        set({
          [fields.data]: data,
          [fields.loadedKey]: key,
          [fields.loading]: false,
          [fields.promise]: null,
        } as Partial<GameDataState>);
      } catch (error) {
        console.error(`Failed to load ${fields.label} data:`, error);
        set({ [fields.loading]: false, [fields.promise]: null } as Partial<GameDataState>);
      }
    })();

    set({ [fields.promise]: loadPromise } as Partial<GameDataState>);
    return loadPromise;
  };
}

export const useGameDataStore = create<GameDataState>((set, get) => ({
  patchVersion: null,
  locale: DEFAULT_LOCALE,
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
  championLoadedKey: null,
  summonerLoadedKey: null,
  itemLoadedKey: null,
  runeLoadedKey: null,

  /**
   * 패치/언어를 바꾼다. 이미 받아둔 데이터는 새 데이터가 도착할 때까지 그대로 두어
   * 언어 전환 순간에 툴팁·스펠 이름이 빈 칸으로 깜빡이지 않게 한다.
   */
  setGameDataContext: (patchVersion, locale) => {
    const state = get();
    if (state.patchVersion === patchVersion && state.locale === locale) {
      return;
    }

    set({
      patchVersion,
      locale,
      // 진행 중이던 요청은 이전 컨텍스트의 것 — 새 요청을 막지 않도록 놓아준다
      championLoadPromise: null,
      summonerLoadPromise: null,
      itemLoadPromise: null,
      runeLoadPromise: null,
    });
  },

  loadChampionData: createLoader<ChampionJson>(set, get, {
    data: "championData",
    loading: "isLoadingChampion",
    promise: "championLoadPromise",
    loadedKey: "championLoadedKey",
    file: GAME_DATA_FILES.champion,
    label: "champion",
  }),

  loadSummonerData: createLoader<SummonerJson>(set, get, {
    data: "summonerData",
    loading: "isLoadingSummoner",
    promise: "summonerLoadPromise",
    loadedKey: "summonerLoadedKey",
    file: GAME_DATA_FILES.summoner,
    label: "summoner",
  }),

  loadItemData: createLoader<ItemJson>(set, get, {
    data: "itemData",
    loading: "isLoadingItem",
    promise: "itemLoadPromise",
    loadedKey: "itemLoadedKey",
    file: GAME_DATA_FILES.item,
    label: "item",
  }),

  loadRuneData: createLoader<RuneReforgedData>(set, get, {
    data: "runeData",
    loading: "isLoadingRune",
    promise: "runeLoadPromise",
    loadedKey: "runeLoadedKey",
    file: GAME_DATA_FILES.rune,
    label: "rune",
  }),

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
