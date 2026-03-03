import { getChampionRanking } from "../api/matchApi";
import type { ChampionStat } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useChampionRanking(
  puuid: string,
  season: string,
  queueId?: number,
  platform?: string
) {
  return useQuery<ChampionStat[], Error>({
    queryKey: ["champion", "ranking", puuid, season, queueId, platform],
    queryFn: () => getChampionRanking(puuid, season, queueId, platform),
    enabled: !!puuid && !!season,
    staleTime: 5 * 60 * 1000,
  });
}
