import type {
  ApiResponse,
  DailyMatchCount,
  MatchDetail,
  ChampionStat,
  MatchIdsResponse,
  SummonerMatchesResponse,
} from "@/types/api";
import { apiClient } from "./client";

/**
 * 게임 아이디 리스트 조회
 * GET /api/v1/{region}/matches/matchIds?puuid={puuid}&queueId={queueId}&pageNo={pageNo}
 * @param puuid 조회할 유저의 PUUID
 * @param queueId 큐 ID (e.g., 420:솔로랭크, 430:일반, 450:칼바람)
 * @param pageNo 페이지 번호 (0부터 시작)
 * @param region 지역
 * @returns 매치 ID 목록과 다음 페이지 존재 여부
 */
export async function getMatchIds(
  puuid: string,
  queueId?: number,
  pageNo: number = 0,
  region: string = "kr"
): Promise<MatchIdsResponse> {
  const response = await apiClient.get<ApiResponse<MatchIdsResponse>>(
    `/v1/${region}/matches/matchIds`,
    {
      params: {
        puuid,
        ...(queueId !== undefined && { queueId }),
        pageNo,
      },
    }
  );
  return response.data.data;
}

/**
 * 소환사 매치 배치 조회
 * GET /api/v1/{region}/summoners/{puuid}/matches?queueId={queueId}&pageNo={pageNo}
 * @param puuid 조회할 유저의 PUUID
 * @param queueId 큐 ID (선택)
 * @param pageNo 페이지 번호 (1부터 시작)
 * @param region 지역
 * @returns 매치 상세 정보 목록과 다음 페이지 존재 여부
 */
export async function getSummonerMatches(
  puuid: string,
  queueId?: number,
  pageNo: number = 1,
  region: string = "kr"
): Promise<SummonerMatchesResponse> {
  const response = await apiClient.get<ApiResponse<SummonerMatchesResponse>>(
    `/v1/${region}/summoners/${puuid}/matches`,
    {
      params: {
        ...(queueId !== undefined && { queueId }),
        pageNo,
      },
    }
  );
  return response.data.data;
}

/**
 * 게임 상세 조회
 * GET /api/v1/matches/{matchId}
 * @param matchId 조회할 매치 ID
 * @returns 매치 상세 정보
 */
export async function getMatchDetail(matchId: string): Promise<MatchDetail> {
  const response = await apiClient.get<ApiResponse<MatchDetail>>(
    `/v1/matches/${matchId}`
  );
  return response.data.data;
}

/**
 * 일별 매치 수 조회
 * GET /api/v1/{region}/summoners/{puuid}/matches/daily-count?season={season}&queueId={queueId}
 * @param region 지역
 * @param puuid 소환사 PUUID
 * @param season 시즌
 * @param queueId 큐 ID (선택)
 * @returns 일별 매치 수 배열
 */
export async function getDailyMatchCount(
  region: string,
  puuid: string,
  season: string,
  queueId?: number
): Promise<DailyMatchCount[]> {
  const response = await apiClient.get<ApiResponse<DailyMatchCount[]>>(
    `/v1/${region}/summoners/${puuid}/matches/daily-count`,
    {
      params: {
        season,
        ...(queueId !== undefined && { queueId }),
      },
    }
  );
  return response.data.data;
}

/**
 * 게임-챔피언 랭킹 조회
 * GET /api/v1/rank/champions?puuid={puuid}&season={season}&queueId={queueId}&platform={platform}
 * @param puuid 조회할 유저의 PUUID
 * @param season 시즌
 * @param queueId 큐 ID (선택)
 * @param platform 플랫폼(지역) (선택)
 * @returns 챔피언 통계 배열
 */
export async function getChampionRanking(
  puuid: string,
  season: string,
  queueId?: number,
  platform?: string
): Promise<ChampionStat[]> {
  const response = await apiClient.get<ApiResponse<ChampionStat[]>>(
    `/v1/rank/champions`,
    {
      params: {
        puuid,
        season,
        ...(queueId !== undefined && { queueId }),
        ...(platform !== undefined && { platform }),
      },
    }
  );
  return response.data.data;
}

