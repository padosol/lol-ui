import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { PositionChampionStats } from "../types";

export async function getChampionPositionStats(
  platformId: string,
  patch: string,
  tier?: string
): Promise<PositionChampionStats[]> {
  const response = await apiClient.get<ApiResponse<PositionChampionStats[]>>(
    `/v1/${platformId}/champion-stats/positions`,
    { params: { patch, ...(tier && { tier }) } }
  );
  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "포지션별 챔피언 통계 조회에 실패했습니다.");
  }
  return response.data.data;
}
