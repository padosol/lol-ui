import type { PersonSearchParams, TeamListParams } from "../types";

/**
 * e스포츠 쿼리 키. 관리자 화면에서 무엇이든 바꾸면 `esportsKeys.all` 을 통째로 무효화한다 —
 * 사건 하나가 상태·로스터·커리어·검증 결과를 함께 바꾸고, 관리자 화면은 자주 쓰이지 않아 재조회 비용이 작다.
 */
export const esportsKeys = {
  all: ["esports"] as const,
  leagues: () => [...esportsKeys.all, "leagues"] as const,
  seasons: (leagueId: string) => [...esportsKeys.all, "leagues", leagueId, "seasons"] as const,
  teams: (params: TeamListParams = {}) => [...esportsKeys.all, "teams", params] as const,
  team: (teamId: string) => [...esportsKeys.all, "team", teamId] as const,
  roster: (teamId: string) => [...esportsKeys.team(teamId), "roster"] as const,
  members: (teamId: string) => [...esportsKeys.team(teamId), "members"] as const,
  seasonRosters: (seasonId: string, teamId?: string) =>
    [...esportsKeys.all, "seasons", seasonId, "rosters", teamId ?? null] as const,
  persons: (params: PersonSearchParams = {}) => [...esportsKeys.all, "persons", params] as const,
  person: (personId: string) => [...esportsKeys.all, "person", personId] as const,
  career: (personId: string) => [...esportsKeys.person(personId), "career"] as const,
  summonerPerson: (puuid: string) => [...esportsKeys.all, "summoner", puuid, "person"] as const,
  admin: {
    all: () => [...esportsKeys.all, "admin"] as const,
    summonerLinks: (personId: string) =>
      [...esportsKeys.admin.all(), "person", personId, "summoners"] as const,
    contracts: (personId: string) =>
      [...esportsKeys.admin.all(), "person", personId, "contracts"] as const,
    rosterIssues: () => [...esportsKeys.admin.all(), "roster-issues"] as const,
  },
};
