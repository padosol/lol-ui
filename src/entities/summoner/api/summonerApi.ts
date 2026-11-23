import type { ApiResponse } from "@/shared/api/types";
import type {
  SummonerAutocompleteItem,
  SummonerProfile,
  SummonerRenewalResponse,
  SummonerRenewalStatusResponse,
} from "../types";
import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";
import { getApiErrorStatus } from "@/shared/api/error";

export async function searchSummonerAutocomplete(
  query: string,
  region: string = "kr"
): Promise<SummonerAutocompleteItem[]> {
  const response = await apiClient.get<ApiResponse<SummonerAutocompleteItem[]>>(
    "/v1/summoners/autocomplete",
    { params: { q: query, platform: region } }
  );
  return response.data.data;
}

export async function getSummonerProfile(
  gameName: string,
  region: string = "kr",
  client: AxiosInstance = apiClient
): Promise<SummonerProfile> {
  const response = await client.get<ApiResponse<SummonerProfile>>(
    `/v1/summoners/by-riot-id/${encodeURIComponent(gameName)}`,
    { params: { platform: region } }
  );
  return response.data.data;
}

/**
 * puuid 로 소환사(Riot ID·티어). lol-repository 에 저장된 소환사만 돌려준다 — 없으면(404) null.
 * e스포츠 인물에 연결된 계정을 보여줄 때 쓴다(MP-190·MP-193). lol-server 는 puuid 만 준다.
 */
export async function getSummonerByPuuid(
  puuid: string,
  client: AxiosInstance = apiClient
): Promise<SummonerProfile | null> {
  try {
    const response = await client.get<ApiResponse<SummonerProfile>>(
      `/v1/summoners/${encodeURIComponent(puuid)}`,
      { skipAuthRedirect: true }
    );
    return response.data.data;
  } catch (error) {
    if (getApiErrorStatus(error) === 404) return null;
    throw error;
  }
}

/** 접수되면 202, 쿨다운에 걸리면 200 + FAILED — 둘 다 2xx 라 resolve 된다. */
export async function renewSummoner(
  puuid: string
): Promise<SummonerRenewalResponse> {
  const response = await apiClient.post<ApiResponse<SummonerRenewalResponse>>(
    `/v1/summoners/${puuid}/renewal`
  );
  return response.data.data;
}

export async function getSummonerRenewalStatus(
  puuid: string
): Promise<SummonerRenewalStatusResponse> {
  const response = await apiClient.get<
    ApiResponse<SummonerRenewalStatusResponse>
  >(`/v1/summoners/${puuid}/renewal`);
  return response.data.data;
}
