import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { Season } from "../types";

export async function getSeasons(): Promise<Season[]> {
  const response = await apiClient.get<ApiResponse<Season[]>>("/v1/seasons");
  return response.data.data;
}

export async function getSeasonById(seasonId: number): Promise<Season> {
  const response = await apiClient.get<ApiResponse<Season>>(
    `/v1/seasons/${seasonId}`
  );
  return response.data.data;
}
