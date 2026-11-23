import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PageResponse } from "@/shared/api/types";
import {
  getEsportsLeagues,
  getEsportsTeams,
  getLeagueSeasons,
  getPersonBySummoner,
  getPersonCareer,
  getPersonProfile,
  getSeasonRosters,
  getTeamDetail,
  getTeamMembers,
  getTeamRoster,
  searchPersons,
} from "../api/esportsApi";
import type {
  EsportsLeague,
  EsportsSeason,
  EsportsTeam,
  EsportsTeamDetail,
  PersonCareer,
  PersonProfile,
  PersonSearchParams,
  PersonSummary,
  SeasonRosterRow,
  TeamListParams,
  TeamMember,
  TeamRoster,
} from "../types";
import { esportsKeys } from "./esportsKeys";

/**
 * 공개 조회 hook. 상태·로스터는 서버의 "오늘"(DB CURRENT_DATE) 기준으로 계산되므로 길게 캐시하지 않는다.
 * 리그·팀처럼 거의 안 바뀌는 마스터 데이터만 오래 둔다.
 */
const STATUS_STALE_TIME = 2 * 60 * 1000;
const MASTER_STALE_TIME = 10 * 60 * 1000;

export function useEsportsLeagues() {
  return useQuery<EsportsLeague[], Error>({
    queryKey: esportsKeys.leagues(),
    queryFn: () => getEsportsLeagues(),
    staleTime: MASTER_STALE_TIME,
  });
}

export function useLeagueSeasons(leagueId: string | null | undefined) {
  return useQuery<EsportsSeason[], Error>({
    queryKey: esportsKeys.seasons(leagueId ?? ""),
    queryFn: () => getLeagueSeasons(leagueId as string),
    enabled: !!leagueId,
    staleTime: MASTER_STALE_TIME,
  });
}

/** 팀 목록. 다른 팀 ID 를 이름으로 바꿀 때는 `{ includeDisbanded: true }` 로 받아 `indexTeams` 에 넣는다. */
export function useEsportsTeams(params: TeamListParams = {}) {
  return useQuery<EsportsTeam[], Error>({
    queryKey: esportsKeys.teams(params),
    queryFn: () => getEsportsTeams(params),
    staleTime: MASTER_STALE_TIME,
  });
}

export function useTeamDetail(teamId: string, initialData?: EsportsTeamDetail) {
  return useQuery<EsportsTeamDetail, Error>({
    queryKey: esportsKeys.team(teamId),
    queryFn: () => getTeamDetail(teamId),
    enabled: !!teamId,
    staleTime: MASTER_STALE_TIME,
    initialData,
  });
}

export function useTeamRoster(teamId: string, initialData?: TeamRoster) {
  return useQuery<TeamRoster, Error>({
    queryKey: esportsKeys.roster(teamId),
    queryFn: () => getTeamRoster(teamId),
    enabled: !!teamId,
    staleTime: STATUS_STALE_TIME,
    initialData,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery<TeamMember[], Error>({
    queryKey: esportsKeys.members(teamId),
    queryFn: () => getTeamMembers(teamId),
    enabled: !!teamId,
    staleTime: STATUS_STALE_TIME,
  });
}

export function useSeasonRosters(seasonId: string | null | undefined, teamId?: string) {
  return useQuery<SeasonRosterRow[], Error>({
    queryKey: esportsKeys.seasonRosters(seasonId ?? "", teamId),
    queryFn: () => getSeasonRosters(seasonId as string, teamId),
    enabled: !!seasonId,
    staleTime: MASTER_STALE_TIME,
  });
}

/** 인물 검색. 페이지를 넘길 때 이전 페이지를 유지해 목록이 깜빡이지 않게 한다. */
export function usePersonSearch(
  params: PersonSearchParams,
  options: { enabled?: boolean; initialData?: PageResponse<PersonSummary> } = {}
) {
  return useQuery<PageResponse<PersonSummary>, Error>({
    queryKey: esportsKeys.persons(params),
    queryFn: () => searchPersons(params),
    enabled: options.enabled ?? true,
    staleTime: STATUS_STALE_TIME,
    placeholderData: keepPreviousData,
    initialData: options.initialData,
  });
}

export function usePersonProfile(personId: string, initialData?: PersonProfile) {
  return useQuery<PersonProfile, Error>({
    queryKey: esportsKeys.person(personId),
    queryFn: () => getPersonProfile(personId),
    enabled: !!personId,
    staleTime: STATUS_STALE_TIME,
    initialData,
  });
}

export function usePersonCareer(personId: string, initialData?: PersonCareer) {
  return useQuery<PersonCareer, Error>({
    queryKey: esportsKeys.career(personId),
    queryFn: () => getPersonCareer(personId),
    enabled: !!personId,
    staleTime: STATUS_STALE_TIME,
    initialData,
  });
}

/**
 * 전적 화면 배지용 "이 소환사가 누구인지". 프로가 아니면 data 가 null 이다.
 * 실패해도 다시 묻지 않는다 — 배지가 없을 뿐 전적 화면은 그대로 떠야 한다(MP-194).
 */
export function useSummonerPerson(puuid: string | null | undefined) {
  return useQuery<PersonSummary | null, Error>({
    queryKey: esportsKeys.summonerPerson(puuid ?? ""),
    queryFn: () => getPersonBySummoner(puuid as string),
    enabled: !!puuid,
    staleTime: STATUS_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
