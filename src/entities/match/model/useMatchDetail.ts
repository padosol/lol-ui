import { getMatchDetail } from "../api/matchApi";
import type { MatchDetail } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useMatchDetail(matchId: string) {
  return useQuery<MatchDetail, Error>({
    queryKey: ["match", "detail", matchId],
    queryFn: () => getMatchDetail(matchId),
    enabled: !!matchId,
    staleTime: 10 * 60 * 1000,
  });
}
