import type { ApiResponse } from "@/shared/api/types";
import type {
  SummonerAutocompleteItem,
  SummonerProfile,
  SummonerRenewalResponse,
  SummonerRenewalStatusResponse,
} from "../types";
import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";

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
