import type {
  ApiResponse,
  MatchDetail,
  ChampionStat,
  MatchIdsResponse,
} from "@/types/api";
import { apiClient } from "./client";

/**
 * 게임 아이디 리스트 조회
 * GET /api/v1/matches/matchIds?puuid={puuid}&queueId={queueId}&pageNo={pageNo}&region={region}
 * @param puuid 조회할 유저의 PUUID
 * @param queueId 큐 ID (e.g., 420:솔로랭크, 430:일반, 450:칼바람)
 * @param pageNo 페이지 번호 (1부터 시작)
 * @param region 지역
 * @returns 매치 ID 목록과 다음 페이지 존재 여부
 */
export async function getMatchIds(
  puuid: string,
  queueId?: number,
  pageNo: number = 1,
  region: string = "kr"
): Promise<MatchIdsResponse> {
  const response = await apiClient.get<ApiResponse<MatchIdsResponse>>(
    `/v1/matches/matchIds`,
    {
      params: {
        puuid,
        ...(queueId !== undefined && { queueId }),
        pageNo,
        region,
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

