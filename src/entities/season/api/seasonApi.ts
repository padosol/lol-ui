import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { Season } from "../types";

export async function getSeasons(
  client: AxiosInstance = apiClient
): Promise<Season[]> {
  const response = await client.get<ApiResponse<Season[]>>("/v1/seasons");
  return response.data.data;
}

export async function getSeasonById(
  seasonId: number,
  client: AxiosInstance = apiClient
): Promise<Season> {
  const response = await client.get<ApiResponse<Season>>(
    `/v1/seasons/${seasonId}`
  );
  return response.data.data;
}
