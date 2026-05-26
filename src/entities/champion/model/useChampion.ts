import { useMemo } from "react";
import {
  useGameDataStore,
  type ChampionData,
} from "@/shared/model/game-data";

export function useChampionById(championId: number): ChampionData | null {
  const championData = useGameDataStore((s) => s.championData);

  return useMemo(() => {
    if (!championData) {
      return null;
    }
    const champion = Object.values(championData.data).find(
      (c) => c.key === String(championId)
    );
    return champion || null;
  }, [championData, championId]);
}

export function useChampionsByIds(championIds: number[]): ChampionData[] {
  const championData = useGameDataStore((s) => s.championData);
  const idsKey = championIds.join(",");

  return useMemo(() => {
    if (!championData) {
      return [];
    }
    const idSet = new Set(idsKey ? idsKey.split(",") : []);
    return Object.values(championData.data).filter((c) => idSet.has(c.key));
  }, [championData, idsKey]);
}
