import { getSummonerMatches } from "../api/matchApi";
import type { SummonerMatchesResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useSummonerMatches(
  puuid: string,
  queueId?: number,
  page: number = 0,
  season?: string,
  enabled: boolean = true
) {
  return useQuery<SummonerMatchesResponse, Error>({
    queryKey: ["summoner", "matches", puuid, queueId, page, season],
    queryFn: () => getSummonerMatches(puuid, queueId, page, season),
    enabled: !!puuid && enabled,
    staleTime: 2 * 60 * 1000,
  });
}
