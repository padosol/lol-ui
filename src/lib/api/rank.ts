import type { ApiResponse, RankingResponse } from "@/types/api";
import { apiClient } from "./client";

/**
 * 랭킹 조회
 * GET /api/v1/{region}/rank
 * @param region 지역 (kr, na 등)
 * @param rankType 랭크 타입 (SOLO, FLEX)
 * @param page 페이지 번호 (1부터 시작)
 * @param tier 티어 필터 (선택)
 * @returns 랭킹 응답 (페이지네이션 정보 포함)
 */
export async function getRanking(
  region: string,
  rankType: "SOLO" | "FLEX",
  page: number,
  tier?: string
): Promise<RankingResponse> {
  const response = await apiClient.get<ApiResponse<RankingResponse>>(
    `/v1/${region}/rank`,
    { params: { rankType, page, ...(tier && { tier }) } }
  );
  return response.data.data;
}
