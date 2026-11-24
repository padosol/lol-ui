import type { EsportsTeam, LocalDate } from "../types";

/** 해체일이 오늘이거나 지난 팀. 커리어에서 해체 팀으로 링크가 이어지므로 팀 화면이 구분해 보여준다. */
export function isDisbanded(team: Pick<EsportsTeam, "disbandedAt">, today: LocalDate): boolean {
  return team.disbandedAt !== null && team.disbandedAt <= today;
}

/** 조직 ID. CL 팀(T1A)은 상위 팀(T1)의 ID, 상위 팀이 없으면 자기 ID. 이적·임대의 "다른 팀" 판단 단위다. */
export function organizationIdOf(team: Pick<EsportsTeam, "teamId" | "parentTeamId">): string {
  return team.parentTeamId ?? team.teamId;
}

/**
 * 팀 ID → 팀. 로스터·커리어 응답은 다른 팀을 ID 로만 준다(loanTeamId, nextTeamId, tenure.teamIds …).
 * 이름·로고는 `getEsportsTeams({ includeDisbanded: true })` 목록을 이 맵으로 만들어 찾는다.
 */
export function indexTeams(teams: readonly EsportsTeam[]): Map<string, EsportsTeam> {
  return new Map(teams.map((team) => [team.teamId, team]));
}
