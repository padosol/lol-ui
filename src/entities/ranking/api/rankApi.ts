import type { ApiResponse } from "@/shared/api/types";
import type { RankingResponse, TierCutoffResponse } from "../types";
import { apiClient } from "@/shared/api/client";

export async function getRanking(
  region: string,
  rankType: "SOLO" | "FLEX",
  page: number,
  tier?: string
): Promise<RankingResponse> {
  const response = await apiClient.get<ApiResponse<RankingResponse>>(
    "/v1/rankings",
    { params: { platform: region, queue: rankType, page, ...(tier && { tier }) } }
  );
  return response.data.data;
}

export async function getTierCutoffs(
  region: string,
  queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR"
): Promise<TierCutoffResponse> {
  const response = await apiClient.get<ApiResponse<TierCutoffResponse>>(
    "/v1/rankings/tier-cutoffs",
    { params: { platform: region, queue } }
  );
  return response.data.data;
}
