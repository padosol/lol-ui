import { getSummonerMatches } from "../api/matchApi";
import type { SummonerMatchesResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useSummonerMatches(
  puuid: string,
  queueId?: number,
  pageNo: number = 0,
  region: string = "kr",
  season?: string
) {
  return useQuery<SummonerMatchesResponse, Error>({
    queryKey: ["summoner", "matches", puuid, queueId, pageNo, region, season],
    queryFn: () => getSummonerMatches(puuid, queueId, pageNo, region, season),
    enabled: !!puuid,
    staleTime: 2 * 60 * 1000,
  });
}
