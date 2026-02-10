import type { ApiResponse, LeagueInfoResponse } from "@/types/api";
import type { AxiosInstance } from "axios";
import { apiClient } from "./client";

/**
 * 유저 리그 정보 조회
 * GET /api/v1/leagues/by-puuid/{puuid}
 * @param puuid 조회할 소환사의 PUUID
 * @returns 리그 정보 객체
 */
export async function getLeagueByPuuid(
  puuid: string,
  client: AxiosInstance = apiClient
): Promise<LeagueInfoResponse> {
  const response = await client.get<ApiResponse<LeagueInfoResponse>>(
    `/v1/leagues/by-puuid/${puuid}`
  );
  return response.data.data;
}
