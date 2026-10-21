import { getChampionRanking } from "../api/matchApi";
import type { RankChampionsResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useChampionRanking(puuid: string, season: string) {
  return useQuery<RankChampionsResponse, Error>({
    queryKey: ["champion", "ranking", puuid, season],
    queryFn: () => getChampionRanking(puuid, season),
    enabled: !!puuid && !!season,
    staleTime: 5 * 60 * 1000,
  });
}
