import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { ChampionStatsResponse } from "../types";

export async function getChampionStats(
  region: string,
  championId: string,
  patch: string,
  tier?: string,
  client: AxiosInstance = apiClient
): Promise<ChampionStatsResponse> {
  const response = await client.get<ApiResponse<ChampionStatsResponse>>(
    `/v1/${region}/champion-stats`,
    { params: { championId, patch, ...(tier && { tier }) } }
  );
  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "챔피언 통계 조회에 실패했습니다.");
  }
  return response.data.data;
}
