import type { ApiResponse, ChampionRotationResponse } from "@/types/api";
import { apiClient } from "./client";

/**
 * 챔피언 로테이션 조회
 * GET /api/v1/{region}/champion/rotation
 * @param region 조회할 지역 (기본값: "kr")
 * @returns 챔피언 로테이션 정보
 */
export async function getChampionRotate(
  region: string = "kr"
): Promise<ChampionRotationResponse> {
  const response = await apiClient.get<ApiResponse<ChampionRotationResponse>>(
    `/v1/${region}/champion/rotation`
  );
  return response.data.data;
}

