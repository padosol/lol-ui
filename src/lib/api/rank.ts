import type { ApiResponse, RankingPlayer } from "@/types/api";
import { apiClient } from "./client";

/**
 * 랭킹 조회
 * GET /api/v1/{region}/rank
 * @param region 지역 (kr, na 등)
 * @param rankType 랭크 타입 (SOLO, FLEX)
 * @param page 페이지 번호 (1부터 시작)
 * @param tier 티어 필터 (선택)
 * @returns 랭킹 플레이어 목록
 */
export async function getRanking(
  region: string,
  rankType: "SOLO" | "FLEX",
  page: number,
  tier?: string
): Promise<RankingPlayer[]> {
  const response = await apiClient.get<ApiResponse<RankingPlayer[]>>(
    `/v1/${region}/rank`,
    { params: { rankType, page, ...(tier && { tier }) } }
  );
  return response.data.data;
}
