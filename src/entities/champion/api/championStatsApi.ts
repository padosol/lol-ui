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
    // 표시 문구는 호출부가 번역해 보여준다. 여기서는 원인 식별용 기술 메시지만 남긴다.
    throw new Error(response.data.errorMessage || "Failed to fetch champion stats");
  }
  return response.data.data;
}
