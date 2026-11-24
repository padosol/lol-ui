import type { EsportsLeague, EsportsSeason } from "../types";

/** 공개 화면의 리그 선택지 — 운영 중인 지역 리그(LCK, LCK CL …)만, sortOrder 순. 국제 대회는 팀 소속 리그가 아니다. */
export function publicLeagues(leagues: readonly EsportsLeague[]): EsportsLeague[] {
  return leagues
    .filter((league) => league.active && !league.international)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** `?league=` 로 고른 리그. 목록에 없거나 비어 있으면 첫 리그(기본 LCK). */
export function pickLeague(
  leagues: readonly EsportsLeague[],
  leagueId: string | undefined
): EsportsLeague | null {
  return leagues.find((league) => league.leagueId === leagueId) ?? leagues[0] ?? null;
}

export function leagueLabel(league: Pick<EsportsLeague, "name" | "nameAcronym">): string {
  return league.nameAcronym ?? league.name;
}

/** 머리글의 "2026 시즌". 시즌 목록은 시작일 내림차순으로 온다. */
export function latestSeasonYear(seasons: readonly EsportsSeason[]): number | null {
  return seasons.find((season) => season.year !== null)?.year ?? null;
}
