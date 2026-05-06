import { useQuery } from "@tanstack/react-query";
import { getChampionTimeline } from "../api/championTimelineApi";
import type { ChampionTimelineResponse } from "../types";

export function useChampionTimeline(
  championKey: string,
  patch: string,
  tier?: string,
  region: string = "kr"
) {
  return useQuery<ChampionTimelineResponse, Error>({
    queryKey: ["champion-timeline", championKey, patch, tier, region],
    queryFn: () => getChampionTimeline(region, championKey, patch, tier),
    enabled: !!championKey && !!patch,
    staleTime: 30 * 60 * 1000,
  });
}
