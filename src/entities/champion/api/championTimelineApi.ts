import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { ChampionTimelineResponse } from "../types";

export async function getChampionTimeline(
  region: string,
  championId: string,
  patch: string,
  tier?: string,
  client: AxiosInstance = apiClient
): Promise<ChampionTimelineResponse> {
  const response = await client.get<ApiResponse<ChampionTimelineResponse>>(
    `/v1/${region}/champion-stats/timeline`,
    { params: { championId, patch, ...(tier && { tier }) } }
  );
  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "챔피언 타임라인 조회에 실패했습니다.");
  }
  return response.data.data;
}
