import type { ApiResponse } from "@/shared/api/types";
import type { LeagueInfoResponse } from "../types";
import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";

export async function getLeagueByPuuid(
  puuid: string,
  client: AxiosInstance = apiClient
): Promise<LeagueInfoResponse> {
  const response = await client.get<ApiResponse<LeagueInfoResponse>>(
    `/v1/leagues/by-puuid/${puuid}`
  );
  return response.data.data;
}
