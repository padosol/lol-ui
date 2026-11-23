/**
 * e스포츠 화면 경로(로케일 prefix 없이 — `@/shared/i18n/navigation` 의 Link 가 붙인다).
 *
 * 화면을 만드는 이슈보다 링크를 거는 이슈가 먼저 끝날 수 있어 경로를 여기서 먼저 정한다.
 * 예: 배지(MP-194)·로스터(MP-192)가 인물 프로필(MP-193)로 링크한다.
 */

const enc = encodeURIComponent;

/** 팀 페이지(현재 로스터·역대 인원·시즌 로스터) — MP-192 */
export function esportsTeamHref(teamId: string): string {
  return `/esports/teams/${enc(teamId)}`;
}

/** 인물 프로필·커리어 — MP-193 */
export function esportsPersonHref(personId: string): string {
  return `/esports/persons/${enc(personId)}`;
}

/** 스토브리그(FA·계약 만료 예정) — MP-195 */
export function stoveLeagueHref(): string {
  return "/esports/stove-league";
}

/** 관리자 화면 — MP-188~191 */
export const adminEsportsHref = {
  root: "/admin/esports",
  /** 리그·시즌 — MP-189 */
  leagues: "/admin/esports/leagues",
  /** 팀 목록 — MP-189 */
  teams: "/admin/esports/teams",
  team: (teamId: string) => `/admin/esports/teams/${enc(teamId)}`,
  /** 인물 검색·등록 — MP-190 */
  persons: "/admin/esports/persons",
  /** 인물 수정·소환사 연결 — MP-190 */
  person: (personId: string) => `/admin/esports/persons/${enc(personId)}`,
  /** 계약 사건 입력·정정 — MP-191 */
  personContracts: (personId: string) => `/admin/esports/persons/${enc(personId)}/contracts`,
  /** 검증 결과 — MP-191 */
  rosterIssues: "/admin/esports/roster-issues",
} as const;
