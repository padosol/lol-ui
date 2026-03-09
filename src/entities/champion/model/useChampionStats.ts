import { getChampionStats } from "../api/championStatsApi";
import type { ChampionStatsResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useChampionStats(
  championKey: string,
  patch: string,
  tier?: string,
  region: string = "kr",
  position?: string
) {
  return useQuery<ChampionStatsResponse, Error>({
    queryKey: ["champion-stats", championKey, patch, tier, region, position],
    queryFn: () => getChampionStats(region, championKey, patch, tier, position),
    enabled: !!championKey && !!patch,
    staleTime: 5 * 60 * 1000,
  });
}
