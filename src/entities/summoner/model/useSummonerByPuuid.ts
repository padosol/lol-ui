import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSummonerByPuuid } from "../api/summonerApi";

/**
 * puuid → 소환사 쿼리 옵션. 계정 여러 개는 `useQueries({ queries: puuids.map(summonerByPuuidQuery) })`.
 * 저장된 소환사가 없으면 data 가 null 이다.
 */
export function summonerByPuuidQuery(puuid: string) {
  return queryOptions({
    queryKey: ["summoner", "by-puuid", puuid] as const,
    queryFn: () => getSummonerByPuuid(puuid),
    enabled: !!puuid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSummonerByPuuid(puuid: string) {
  return useQuery(summonerByPuuidQuery(puuid));
}
