import type {
  ApiResponse,
  SummonerAutocompleteItem,
  SummonerProfile,
  SummonerRenewalResponse,
} from "@/types/api";
import { apiClient } from "./client";

/**
 * 유저 검색 (자동완성)
 * GET /api/v1/summoners/autocomplete?q={query}&region={region}
 * @param query 검색어
 * @param region 검색할 지역 (기본값: "kr")
 * @returns 소환사 자동완성 목록
 */
export async function searchSummonerAutocomplete(
  query: string,
  region: string = "kr"
): Promise<SummonerAutocompleteItem[]> {
  const response = await apiClient.get<ApiResponse<SummonerAutocompleteItem[]>>(
    `/v1/summoners/autocomplete`,
    {
      params: {
        q: query,
        region,
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
  region: string = "kr"
): Promise<SummonerProfile> {
  const response = await apiClient.get<ApiResponse<SummonerProfile>>(
    `/v1/summoners/${region}/${encodeURIComponent(gameName)}`
  );
  return response.data.data;
}

/**
 * 유저 갱신
 * GET /api/summoners/renewal/{platform}/{puuid}
 * @param platform 플랫폼(지역)
 * @param puuid 소환사 고유 PUUID
 * @returns 갱신 요청 결과
 */
export async function renewSummoner(
  platform: string,
  puuid: string
): Promise<SummonerRenewalResponse> {
  const response = await apiClient.get<ApiResponse<SummonerRenewalResponse>>(
    `/summoners/renewal/${platform}/${puuid}`
  );
  return response.data.data;
}
