import type {
  ApiResponse,
  RankingResponse,
  TierCutoffResponse,
} from "@/types/api";
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

/**
 * 티어 커트오프 조회
 * GET /api/v1/{region}/tier-cutoffs?queue={queue}
 * @param region 지역 (kr, na 등)
 * @param queue 큐 타입 (RANKED_SOLO_5x5, RANKED_FLEX_SR)
 * @returns 티어 커트오프 배열 (챌린저, 그랜드마스터)
 */
export async function getTierCutoffs(
  region: string,
  queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR"
): Promise<TierCutoffResponse> {
  const response = await apiClient.get<ApiResponse<TierCutoffResponse>>(
    `/v1/${region}/tier-cutoffs`,
    { params: { queue } }
  );
  return response.data.data;
}
