import type { ApiResponse } from "@/shared/api/types";
import type {
  SummonerAutocompleteItem,
  SummonerProfile,
  SummonerRenewalResponse,
} from "../types";
import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";

export async function searchSummonerAutocomplete(
  query: string,
  region: string = "kr"
): Promise<SummonerAutocompleteItem[]> {
  const response = await apiClient.get<ApiResponse<SummonerAutocompleteItem[]>>(
    `/v1/${region}/summoners/autocomplete`,
    { params: { q: query } }
  );
  return response.data.data;
}

export async function getSummonerProfile(
  gameName: string,
  region: string = "kr",
  client: AxiosInstance = apiClient
): Promise<SummonerProfile> {
  const response = await client.get<ApiResponse<SummonerProfile>>(
    `/v1/summoners/${region}/${encodeURIComponent(gameName)}`
  );
  console.log(response)
  return response.data.data;
}

export async function renewSummoner(
  platform: string,
  puuid: string
): Promise<SummonerRenewalResponse> {
  const response = await apiClient.get<ApiResponse<SummonerRenewalResponse>>(
    `/v1/${platform}/summoners/${puuid}/renewal`
  );
  return response.data.data;
}

export async function getSummonerRenewalStatus(
  puuid: string
): Promise<SummonerRenewalResponse> {
  const response = await apiClient.get<ApiResponse<SummonerRenewalResponse>>(
    `/v1/summoners/${puuid}/renewal-status`
  );
  return response.data.data;
}
