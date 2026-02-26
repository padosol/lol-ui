import type {
  ApiResponse,
  SummonerAutocompleteItem,
  SummonerProfile,
  SummonerRenewalResponse,
} from "@/types/api";
import type { AxiosInstance } from "axios";
import { apiClient } from "./client";

/**
 * 유저 검색 (자동완성)
 * GET /api/v1/{region}/summoners/autocomplete?q={query}
 * @param query 검색어
 * @param region 검색할 지역 (기본값: "kr")
 * @returns 소환사 자동완성 목록
 */
export async function searchSummonerAutocomplete(
  query: string,
  region: string = "kr"
): Promise<SummonerAutocompleteItem[]> {
  const response = await apiClient.get<ApiResponse<SummonerAutocompleteItem[]>>(
    `/v1/${region}/summoners/autocomplete`,
    {
      params: {
        q: query,
      },
    }
  );
  return response.data.data;
}

/**
 * 유저 상세 조회
 * GET /api/v1/summoners/{region}/{gameName}
 * @param gameName 게임 유저명 (형식: "name-tagLine", 예: "hide on bush-KR1")
 * @param region 지역명 (기본값: "kr")
 * @returns 소환사 프로필 정보
 */
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

/**
 * 유저 갱신
 * GET /api/v1/{platform}/summoners/{puuid}/renewal
 * @param platform 플랫폼(지역)
 * @param puuid 소환사 고유 PUUID
 * @returns 갱신 요청 결과
 */
export async function renewSummoner(
  platform: string,
  puuid: string
): Promise<SummonerRenewalResponse> {
  const response = await apiClient.get<ApiResponse<SummonerRenewalResponse>>(
    `/v1/${platform}/summoners/${puuid}/renewal`
  );
  return response.data.data;
}

/**
 * 유저 갱신 상태 확인
 * GET /api/v1/summoners/{puuid}/renewal-status
 * @param puuid 소환사 고유 PUUID
 * @returns 갱신 상태
 */
export async function getSummonerRenewalStatus(
  puuid: string
): Promise<SummonerRenewalResponse> {
  const response = await apiClient.get<ApiResponse<SummonerRenewalResponse>>(
    `/v1/summoners/${puuid}/renewal-status`
  );
  return response.data.data;
}