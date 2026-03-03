import { getChampionPositionStats } from "../api/championPositionStatsApi";
import type { PositionChampionStats } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useChampionPositionStats(
  platformId: string,
  patch: string,
  tier?: string
) {
  return useQuery<PositionChampionStats[], Error>({
    queryKey: ["champion-position-stats", platformId, patch, tier],
    queryFn: () => getChampionPositionStats(platformId, patch, tier),
    enabled: !!platformId && !!patch,
    staleTime: 5 * 60 * 1000,
  });
}
