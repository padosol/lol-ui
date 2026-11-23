import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { apiClient } from "@/shared/api/client";
import { getApiErrorStatus } from "@/shared/api/error";
import type { ApiResponse, PageResponse } from "@/shared/api/types";
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

/**
 * 공개 조회 — GET /api/v1/esports/** (인증 없음, lol-server).
 *
 * 브라우저에서 부를 때는 refresh 가 실패해도 /login 으로 보내지 않는다. 만료 토큰을 가진 방문자가
 * 공개 화면을 보다가 로그인 화면으로 튕기면 안 된다. SSR 은 `serverApiClient` 를 넘긴다
 * (`/v1/esports/**` 는 repositoryRoutes 대상이 아니라 SSR 에서도 lol-server 로 간다).
 */
const PUBLIC: AxiosRequestConfig = { skipAuthRedirect: true };

const enc = encodeURIComponent;

async function get<T>(
  client: AxiosInstance,
  url: string,
  params?: AxiosRequestConfig["params"]
): Promise<T> {
  const response = await client.get<ApiResponse<T>>(url, { ...PUBLIC, params });
  return response.data.data;
}

/** 리그 목록. active=false 도 섞여 오므로 공개 화면은 걸러서 쓴다. */
export function getEsportsLeagues(client: AxiosInstance = apiClient): Promise<EsportsLeague[]> {
  return get(client, "/v1/esports/leagues");
}

/** 시즌 목록(startDate 내림차순). 리그가 없으면 404. */
export function getLeagueSeasons(
  leagueId: string,
  client: AxiosInstance = apiClient
): Promise<EsportsSeason[]> {
  return get(client, `/v1/esports/leagues/${enc(leagueId)}/seasons`);
}

/** 팀 목록(teamCode 순). 팀 이름 매핑에도 쓴다 — 매핑용이면 includeDisbanded: true. */
export function getEsportsTeams(
  params: TeamListParams = {},
  client: AxiosInstance = apiClient
): Promise<EsportsTeam[]> {
  return get(client, "/v1/esports/teams", params);
}

export function getTeamDetail(
  teamId: string,
  client: AxiosInstance = apiClient
): Promise<EsportsTeamDetail> {
  return get(client, `/v1/esports/teams/${enc(teamId)}`);
}

export function getTeamRoster(
  teamId: string,
  client: AxiosInstance = apiClient
): Promise<TeamRoster> {
  return get(client, `/v1/esports/teams/${enc(teamId)}/roster`);
}

/** 역대 인원(소속 기간 시작일 내림차순). */
export function getTeamMembers(
  teamId: string,
  client: AxiosInstance = apiClient
): Promise<TeamMember[]> {
  return get(client, `/v1/esports/teams/${enc(teamId)}/members`);
}

/** 시즌 로스터. teamId 는 서버가 검증하지 않는다 — 없는 팀이면 빈 배열. */
export function getSeasonRosters(
  seasonId: string,
  teamId?: string,
  client: AxiosInstance = apiClient
): Promise<SeasonRosterRow[]> {
  return get(client, `/v1/esports/seasons/${enc(seasonId)}/rosters`, teamId ? { teamId } : undefined);
}

/** 인물 검색(nickName 순 고정). 포지션 필터는 서버에 없다. */
export function searchPersons(
  params: PersonSearchParams = {},
  client: AxiosInstance = apiClient
): Promise<PageResponse<PersonSummary>> {
  return get(client, "/v1/esports/persons", params);
}

/** 프로필. 이력이 없어도 인물이 있으면 200(status: null). 없으면 404. */
export function getPersonProfile(
  personId: string,
  client: AxiosInstance = apiClient
): Promise<PersonProfile> {
  return get(client, `/v1/esports/persons/${enc(personId)}`);
}

export function getPersonCareer(
  personId: string,
  client: AxiosInstance = apiClient
): Promise<PersonCareer> {
  return get(client, `/v1/esports/persons/${enc(personId)}/career`);
}

/** 전적 화면 배지용. 오래 기다리지 않는다 — 전적 화면은 이 호출과 상관없이 떠야 한다. */
export const SUMMONER_PERSON_TIMEOUT_MS = 3000;

/**
 * "이 소환사가 누구인지". 404 는 정상 결과("프로 아님": 연결 없음 또는 비공개)라 null 로 돌려준다.
 * 그 밖의 실패는 그대로 던진다 — 호출부는 실패해도 아무것도 그리지 않으면 된다.
 */
export async function getPersonBySummoner(
  puuid: string,
  client: AxiosInstance = apiClient
): Promise<PersonSummary | null> {
  try {
    const response = await client.get<ApiResponse<PersonSummary>>(
      `/v1/esports/summoners/${enc(puuid)}/person`,
      { ...PUBLIC, timeout: SUMMONER_PERSON_TIMEOUT_MS }
    );
    return response.data.data;
  } catch (error) {
    if (getApiErrorStatus(error) === 404) return null;
    throw error;
  }
}
