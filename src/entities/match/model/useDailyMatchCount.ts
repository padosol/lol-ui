import { getDailyMatchCount } from "../api/matchApi";
import type { DailyMatchCountResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useDailyMatchCount(
  puuid: string,
  season: string,
  queueId?: number
) {
  return useQuery<DailyMatchCountResponse, Error>({
    queryKey: ["daily-match-count", puuid, season, queueId],
    queryFn: () => getDailyMatchCount(puuid, season, queueId),
    enabled: !!puuid && !!season,
    staleTime: 5 * 60 * 1000,
  });
}
