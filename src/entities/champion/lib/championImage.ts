import {
  useGameDataStore,
  type ChampionData,
  type ChampionJson,
} from "@/shared/model/game-data";
import { IMAGE_HOST } from "@/shared/config/image";

async function loadChampionData(): Promise<ChampionJson | null> {
  const store = useGameDataStore.getState();

  if (store.championData) {
    return store.championData;
  }

  await store.loadChampionData();

  return useGameDataStore.getState().championData;
}

export async function getChampionById(
  championId: number
): Promise<ChampionData | null> {
  try {
    const data = await loadChampionData();
    if (!data) {
      return null;
    }
    const champion = Object.values(data.data).find(c => c.key === String(championId));
    return champion || null;
  } catch (error) {
    console.error("Failed to load champion data:", error);
    return null;
  }
}

export async function getChampionsByIds(
  championIds: number[]
): Promise<ChampionData[]> {
  try {
    const data = await loadChampionData();
    if (!data) {
      return [];
    }
    const idSet = new Set(championIds.map(String));
    return Object.values(data.data).filter(c => idSet.has(c.key));
  } catch (error) {
    console.error("Failed to load champion data:", error);
    return [];
  }
}

export function getChampionImageUrl(championName: string): string {
  if (!championName) {
    return "";
  }
  return `${IMAGE_HOST}/champion/${championName}.png`;
}

export function getChampionNameByEnglishName(englishName: string): string {
  if (!englishName) {
    return "";
  }

  const store = useGameDataStore.getState();
  const championData = store.championData;

  if (!championData || !championData.data) {
    return englishName;
  }

  for (const key in championData.data) {
    const champion = championData.data[key];
    if (champion.id === englishName) {
      return champion.name;
    }
  }

  return englishName;
}
