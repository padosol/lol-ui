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
    // 표시 문구는 호출부가 번역해 보여준다. 여기서는 원인 식별용 기술 메시지만 남긴다.
    throw new Error(
      response.data.errorMessage || "Failed to fetch champion position stats"
    );
  }
  return response.data.data;
}
