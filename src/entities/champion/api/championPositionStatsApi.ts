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
  return response.data.data;
}
