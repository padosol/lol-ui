import { getChampionStats } from "@/lib/api/championStats";
import type { ChampionStatsResponse } from "@/types/championStats";
import { useQuery } from "@tanstack/react-query";

export function useChampionStats(
  championKey: string,
  patch: string,
  tier?: string,
  region: string = "kr"
) {
  return useQuery<ChampionStatsResponse, Error>({
    queryKey: ["champion-stats", championKey, patch, tier, region],
    queryFn: () => getChampionStats(region, championKey, patch, tier),
    enabled: !!championKey && !!patch,
    staleTime: 5 * 60 * 1000,
  });
}
