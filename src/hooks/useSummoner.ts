import { getLeagueByPuuid } from "@/lib/api/league";
import {
  getChampionRanking,
  getMatchDetail,
  getMatchIds,
  getSummonerMatches,
} from "@/lib/api/match";
import { getSummonerProfile, renewSummoner } from "@/lib/api/summoner";
import type {
  ChampionStat,
  LeagueInfoResponse,
  MatchDetail,
  MatchIdsResponse,
  SummonerMatchesResponse,
  SummonerProfile,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * 소환사 프로필 정보 조회 훅
 * @param gameName 게임 유저명 (형식: "name-tagLine", 예: "hide on bush-KR1")
 * @param region 지역명 (기본값: "kr")
 * @param options.initialData 서버에서 미리 가져온 초기 데이터 (SSR용)
 */
export function useSummonerProfile(
  gameName: string,
  region: string = "kr",
  options?: { initialData?: SummonerProfile }
) {
  return useQuery<SummonerProfile, Error>({
    queryKey: ["summoner", "profile", gameName, region],
    queryFn: () => getSummonerProfile(gameName, region),
    enabled: !!gameName, // gameName이 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    initialData: options?.initialData,
  });
}

/**
 * 매치 ID 리스트 조회 훅
 * @param puuid 조회할 유저의 PUUID
 * @param queueId 큐 ID (선택)
 * @param pageNo 페이지 번호 (기본값: 0, 0부터 시작)
 * @param region 지역 (기본값: "kr")
 */
export function useMatchIds(
  puuid: string,
  queueId?: number,
  pageNo: number = 0,
  region: string = "kr"
) {
  return useQuery<MatchIdsResponse, Error>({
    queryKey: ["match", "ids", puuid, queueId, pageNo, region],
    queryFn: () => getMatchIds(puuid, queueId, pageNo, region),
    enabled: !!puuid,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  });
}

/**
 * 소환사 매치 배치 조회 훅
 * @param puuid 조회할 유저의 PUUID
 * @param queueId 큐 ID (선택)
 * @param pageNo 페이지 번호 (1부터 시작)
 * @param region 지역 (기본값: "kr")
 */
export function useSummonerMatches(
  puuid: string,
  queueId?: number,
  pageNo: number = 1,
  region: string = "kr"
) {
  return useQuery<SummonerMatchesResponse, Error>({
    queryKey: ["summoner", "matches", puuid, queueId, pageNo, region],
    queryFn: () => getSummonerMatches(puuid, queueId, pageNo, region),
    enabled: !!puuid,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  });
}

/**
 * 매치 상세 정보 조회 훅
 * @param matchId 조회할 매치 ID
 */
export function useMatchDetail(matchId: string) {
  return useQuery<MatchDetail, Error>({
    queryKey: ["match", "detail", matchId],
    queryFn: () => getMatchDetail(matchId),
    enabled: !!matchId,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지 (매치 정보는 변경되지 않음)
  });
}

/**
 * 챔피언 랭킹 조회 훅
 * @param puuid 조회할 유저의 PUUID
 * @param season 시즌
 * @param queueId 큐 ID (선택)
 * @param platform 플랫폼(지역) (선택)
 */
export function useChampionRanking(
  puuid: string,
  season: string,
  queueId?: number,
  platform?: string
) {
  return useQuery<ChampionStat[], Error>({
    queryKey: ["champion", "ranking", puuid, season, queueId, platform],
    queryFn: () => getChampionRanking(puuid, season, queueId, platform),
    enabled: !!puuid && !!season,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

/**
 * 소환사 리그 정보 조회 훅
 * @param puuid 조회할 소환사의 PUUID
 * @param options.initialData 서버에서 미리 가져온 초기 데이터 (SSR용)
 */
export function useLeagueInfo(
  puuid: string,
  options?: { initialData?: LeagueInfoResponse }
) {
  return useQuery<LeagueInfoResponse, Error>({
    queryKey: ["summoner", "league", puuid],
    queryFn: () => getLeagueByPuuid(puuid),
    enabled: !!puuid,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    initialData: options?.initialData,
  });
}

/**
 * 소환사 데이터 갱신 뮤테이션 훅
 */
export function useRefreshSummonerData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ platform, puuid }: { platform: string; puuid: string }) =>
      renewSummoner(platform, puuid),
    onSuccess: (_, { puuid }) => {
      // 갱신 후 관련 쿼리 무효화하여 자동 재조회
      queryClient.invalidateQueries({
        queryKey: ["summoner", puuid],
      });
    },
  });
}
