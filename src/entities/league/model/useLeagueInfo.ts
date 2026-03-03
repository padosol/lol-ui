import { getLeagueByPuuid } from "../api/leagueApi";
import type { LeagueInfoResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useLeagueInfo(
  puuid: string,
  options?: { initialData?: LeagueInfoResponse }
) {
  return useQuery<LeagueInfoResponse, Error>({
    queryKey: ["summoner", "league", puuid],
    queryFn: () => getLeagueByPuuid(puuid),
    enabled: !!puuid,
    staleTime: 5 * 60 * 1000,
    initialData: options?.initialData,
  });
}
