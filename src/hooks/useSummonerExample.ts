import { useQuery } from "@tanstack/react-query";
import {
  getSummonerByName,
  getLeagueEntriesBySummoner,
  getMatchIdsByPuuid,
  getMatchDetail,
  getChampionMasteries,
} from "@/lib/api/example";
import type {
  SummonerInfoResponse,
  LeagueEntryResponse,
  MatchDetailResponse,
  ChampionMasteryResponse,
} from "@/lib/api/example";

/**
 * 소환사 기본 정보 조회 훅
 */
export function useSummonerInfo(summonerName: string, region: string = "kr") {
  return useQuery<SummonerInfoResponse, Error>({
    queryKey: ["summoner", "info", summonerName, region],
    queryFn: () => getSummonerByName(summonerName, region),
    enabled: !!summonerName,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

/**
 * 소환사 랭크 정보 조회 훅
 */
export function useLeagueEntries(summonerId: string) {
  return useQuery<LeagueEntryResponse[], Error>({
    queryKey: ["summoner", "league", summonerId],
    queryFn: () => getLeagueEntriesBySummoner(summonerId),
    enabled: !!summonerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 매치 ID 리스트 조회 훅
 */
export function useMatchIds(
  puuid: string,
  start: number = 0,
  count: number = 20
) {
  return useQuery<string[], Error>({
    queryKey: ["match", "ids", puuid, start, count],
    queryFn: () => getMatchIdsByPuuid(puuid, start, count),
    enabled: !!puuid,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  });
}

/**
 * 매치 상세 정보 조회 훅
 */
export function useMatchDetail(matchId: string) {
  return useQuery<MatchDetailResponse, Error>({
    queryKey: ["match", "detail", matchId],
    queryFn: () => getMatchDetail(matchId),
    enabled: !!matchId,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지 (매치 정보는 변경되지 않음)
  });
}

/**
 * 챔피언 마스터리 조회 훅
 */
export function useChampionMasteries(summonerId: string) {
  return useQuery<ChampionMasteryResponse[], Error>({
    queryKey: ["champion", "mastery", summonerId],
    queryFn: () => getChampionMasteries(summonerId),
    enabled: !!summonerId,
    staleTime: 5 * 60 * 1000,
  });
}

