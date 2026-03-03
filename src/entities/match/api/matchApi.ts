import type { ApiResponse } from "@/shared/api/types";
import type {
  DailyMatchCount,
  MatchDetail,
  ChampionStat,
  MatchIdsResponse,
  SummonerMatchesResponse,
} from "../types";
import { apiClient } from "@/shared/api/client";

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

export async function getSummonerMatches(
  puuid: string,
  queueId?: number,
  pageNo: number = 0,
  region: string = "kr",
  season?: string
): Promise<SummonerMatchesResponse> {
  const response = await apiClient.get<ApiResponse<SummonerMatchesResponse>>(
    `/v1/${region}/summoners/${puuid}/matches`,
    {
      params: {
        ...(queueId !== undefined && { queueId }),
        pageNo,
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
