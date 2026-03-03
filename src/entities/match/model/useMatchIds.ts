import { getMatchIds } from "../api/matchApi";
import type { MatchIdsResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useMatchIds(
  puuid: string,
  queueId?: number,
  pageNo: number = 0,
  region: string = "kr"
) {
  return useQuery<MatchIdsResponse, Error>({
    queryKey: ["match", "ids", puuid, queueId, pageNo, region],
    queryFn: () => getMatchIds(puuid, queueId, pageNo, region),
    enabled: !!puuid,
    staleTime: 2 * 60 * 1000,
  });
}
