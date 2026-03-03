import { getDailyMatchCount } from "../api/matchApi";
import type { DailyMatchCount } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useDailyMatchCount(
  region: string,
  puuid: string,
  season: string,
  queueId?: number
) {
  return useQuery<DailyMatchCount[], Error>({
    queryKey: ["daily-match-count", region, puuid, season, queueId],
    queryFn: () => getDailyMatchCount(region, puuid, season, queueId),
    enabled: !!puuid && !!season,
    staleTime: 5 * 60 * 1000,
  });
}
