import { useGameDataStore, type SummonerJson, type SummonerSpellData } from "@/shared/model/game-data";
import type { ItemData, ItemSeqEntry } from "@/entities/match/types";
import { IMAGE_HOST } from "@/shared/config/image";

function findSpellByNumericId(data: SummonerJson, spellId: number): SummonerSpellData | undefined {
  const id = String(spellId);
  return Object.values(data.data).find((s) => s.key === id);
}

async function loadSummonerData(): Promise<SummonerJson | null> {
  const store = useGameDataStore.getState();

  if (store.summonerData) {
    return store.summonerData;
  }

  await store.loadSummonerData();

  return useGameDataStore.getState().summonerData;
}

export function getItemName(itemId: number): string {
  if (!itemId || itemId === 0) {
    return "";
  }

  const store = useGameDataStore.getState();
  if (store.itemData) {
    const item = store.itemData.data[String(itemId)];
    if (item) {
      return item.name;
    }
  }

  return "";
}

export function getItemImageUrl(itemId: number): string {
  return `${IMAGE_HOST}/items/${itemId}.png`;
}

export async function getSpellImageUrlAsync(spellId: number): Promise<string> {
  if (!spellId || spellId === 0) {
    return "";
  }

  try {
    const data = await loadSummonerData();
    if (!data) {
      return `${IMAGE_HOST}/spells/${spellId}.png`;
    }
    const spell = findSpellByNumericId(data, spellId);

    if (spell && spell.id) {
      return `${IMAGE_HOST}/spells/${spell.id}.png`;
    }

    return `${IMAGE_HOST}/spells/${spellId}.png`;
  } catch (error) {
    console.error("Failed to load summoner data:", error);
    return `${IMAGE_HOST}/spells/${spellId}.png`;
  }
}

export function getSpellImageUrl(spellId: number): string {
  if (!spellId || spellId === 0) {
    return "";
  }

  const store = useGameDataStore.getState();
  if (store.summonerData) {
    const spell = findSpellByNumericId(store.summonerData, spellId);
    if (spell && spell.id) {
      return `${IMAGE_HOST}/spells/${spell.id}.png`;
    }
  }

  return `${IMAGE_HOST}/spells/${spellId}.png`;
}

export function getPerkImageUrl(perkId: number): string {
  if (!perkId || perkId === 0) {
    return "";
  }
  return `${IMAGE_HOST}/perks/${perkId}.png`;
}

/** @deprecated getPerkImageUrl을 사용하세요. */
export function getRuneImageUrl(runeId: number): string {
  return getPerkImageUrl(runeId);
}

export function extractItemIds(item: ItemData | number[] | ItemSeqEntry[] | null | undefined): number[] {
  if (!item) return [0, 0, 0, 0, 0, 0, 0];

  if (Array.isArray(item)) {
    if (item.length > 0 && typeof item[0] === "object" && "itemId" in item[0]) {
      return (item as ItemSeqEntry[]).slice(0, 7).map((e) => e.itemId || 0);
    }
    return (item as number[]).slice(0, 7).map((id) => id || 0);
  }

  if (typeof item === "object") {
    const items: number[] = [];
    for (let i = 0; i < 7; i++) {
      const key = `item${i}` as keyof ItemData;
      items.push((item[key] as number) || 0);
    }
    return items;
  }

  return [0, 0, 0, 0, 0, 0, 0];
}

export function getChampionSpellImageUrl(championName: string, skillKey: string): string {
  return `${IMAGE_HOST}/spells/${championName}${skillKey}.png`;
}

export function getChampionPassiveImageUrl(passiveImageFull: string): string {
  return `${IMAGE_HOST}/passive/${passiveImageFull}`;
}

export function getKDAColorClass(kdaValue: string | number): string {
  if (
    kdaValue === "perfect" ||
    (typeof kdaValue === "string" && kdaValue.toLowerCase() === "perfect")
  ) {
    return "text-stat-high";
  }

  const kda = typeof kdaValue === "string" ? parseFloat(kdaValue) : kdaValue;
  const integerPart = Math.floor(kda);

  if (integerPart >= 5) {
    return "text-stat-perfect";
  } else if (integerPart >= 4) {
    return "text-stat-low";
  } else if (integerPart >= 3) {
    return "text-stat-mid";
  } else if (integerPart >= 2) {
    return "text-secondary";
  } else {
    return "text-stat-neutral";
  }
}
