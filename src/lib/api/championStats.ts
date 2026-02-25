import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { ChampionStatsResponse } from "@/types/championStats";

export async function getChampionStats(
  region: string,
  championId: string,
  patch: string,
  tier?: string
): Promise<ChampionStatsResponse> {
  const response = await apiClient.get<ApiResponse<ChampionStatsResponse>>(
    `/v1/${region}/champion-stats`,
    { params: { championId, patch, ...(tier && { tier }) } }
  );
  return response.data.data;
}
