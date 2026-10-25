import type { ApiResponse } from "@/shared/api/types";
import type {
  DailyMatchCountResponse,
  MatchDetail,
  RankChampionsResponse,
  SummonerMatchesResponse,
} from "../types";
import { apiClient } from "@/shared/api/client";

/** page 는 0부터. */
export async function getSummonerMatches(
  puuid: string,
  queueId?: number,
  page: number = 0,
  season?: string
): Promise<SummonerMatchesResponse> {
  const response = await apiClient.get<ApiResponse<SummonerMatchesResponse>>(
    `/v1/summoners/${puuid}/matches`,
    {
      params: {
        ...(queueId !== undefined && { queueId }),
        page,
        ...(season !== undefined && { season }),
      },
    }
  );
  return response.data.data;
}

export async function getMatchDetail(matchId: string): Promise<MatchDetail> {
  const response = await apiClient.get<ApiResponse<MatchDetail>>(
    `/v1/matches/${matchId}`
  );
  return response.data.data;
}

export async function getDailyMatchCount(
  puuid: string,
  season: string,
  queueId?: number
): Promise<DailyMatchCountResponse> {
  const response = await apiClient.get<ApiResponse<DailyMatchCountResponse>>(
    `/v1/summoners/${puuid}/matches/daily-count`,
    {
      params: {
        season,
        ...(queueId !== undefined && { queueId }),
      },
    }
  );
  return response.data.data;
}

export async function getChampionRanking(
  puuid: string,
  season: string
): Promise<RankChampionsResponse> {
  const response = await apiClient.get<ApiResponse<RankChampionsResponse>>(
    `/v1/summoners/${puuid}/champions`,
    { params: { season } }
  );
  return response.data.data;
}
