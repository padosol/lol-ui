import { getRanking, getTierCutoffs } from "../api/rankApi";
import type { RankingResponse, TierCutoffResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useRanking(region: string, rankType: "SOLO" | "FLEX", page: number, tier?: string) {
  return useQuery<RankingResponse, Error>({
    queryKey: ["ranking", region, rankType, page, tier],
    queryFn: () => getRanking(region, rankType, page, tier),
    enabled: !!region,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTierCutoffs(region: string, queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR") {
  return useQuery<TierCutoffResponse, Error>({
    queryKey: ["tier-cutoffs", region, queue],
    queryFn: () => getTierCutoffs(region, queue),
    enabled: !!region,
    staleTime: 5 * 60 * 1000,
  });
}
