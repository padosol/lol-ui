import { getRanking } from "@/lib/api/rank";
import type { RankingResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * 랭킹 조회 훅
 * @param region 지역 (kr, na 등)
 * @param rankType 랭크 타입 (SOLO, FLEX)
 * @param page 페이지 번호 (1부터 시작)
 * @param tier 티어 필터 (선택)
 */
export function useRanking(
  region: string,
  rankType: "SOLO" | "FLEX",
  page: number,
  tier?: string
) {
  return useQuery<RankingResponse, Error>({
    queryKey: ["ranking", region, rankType, page, tier],
    queryFn: () => getRanking(region, rankType, page, tier),
    enabled: !!region,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  });
}
