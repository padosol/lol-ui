import type { ApiResponse } from "@/shared/api/types";
import type { ChampionRotationResponse } from "../types";
import { apiClient } from "@/shared/api/client";

export async function getChampionRotate(
  region: string = "kr"
): Promise<ChampionRotationResponse> {
  const response = await apiClient.get<ApiResponse<ChampionRotationResponse>>(
    "/v1/game-data/champion-rotations",
    { params: { platform: region } }
  );
  return response.data.data;
}
