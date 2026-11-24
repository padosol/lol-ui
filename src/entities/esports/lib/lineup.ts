import { ESPORTS_POSITIONS } from "../types";
import type { EsportsPosition, LocalDate, RosterEntry, TeamMember } from "../types";

export interface StartingLineup {
  /** 포지션마다 한 명. 빈 포지션은 null(공석). */
  starters: Record<EsportsPosition, RosterEntry | null>;
  /** 같은 포지션 두 번째 선수부터, 포지션이 없는 선수. */
  subs: RosterEntry[];
}

/**
 * 주전 다섯 명 — 추정이다. 로스터 API 는 주전·후보를 구분하지 않는다.
 *
 * 같은 포지션끼리만 비교해 활동 중인 선수 → 이 팀에 먼저 합류한 선수 → 응답 순서로 고른다.
 * 응답은 포지션 → "지금 계약" 시작일 순이라, 그대로 쓰면 재계약한 주전이 늦게 계약한 후보 뒤로 밀린다.
 * 합류일(`joinDates`, 보통 `currentTenureStarts`)이 없으면 지금 계약 시작일로 대신한다.
 * 후보는 응답 순서(포지션 순) 그대로 둔다.
 */
export function startingLineup(
  players: readonly RosterEntry[],
  joinDates?: ReadonlyMap<string, LocalDate>
): StartingLineup {
  const joined = (player: RosterEntry) => joinDates?.get(player.personId) ?? player.startDate;
  const ahead = (a: RosterEntry, b: RosterEntry) => {
    if (a.inactive !== b.inactive) return !a.inactive;
    return joined(a) < joined(b);
  };

  const starters = Object.fromEntries(ESPORTS_POSITIONS.map((position) => [position, null])) as Record<
    EsportsPosition,
    RosterEntry | null
  >;
  for (const player of players) {
    if (!player.position) continue;
    const current = starters[player.position];
    if (current === null || ahead(player, current)) starters[player.position] = player;
  }

  const chosen = new Set(Object.values(starters));
  return { starters, subs: players.filter((player) => !chosen.has(player)) };
}

export function splitStaff(staff: readonly RosterEntry[]): {
  headCoaches: RosterEntry[];
  coaches: RosterEntry[];
} {
  return {
    headCoaches: staff.filter((entry) => entry.role === "HEAD_COACH"),
    coaches: staff.filter((entry) => entry.role === "COACH"),
  };
}

/**
 * 인물 ID → 이 팀 합류일. 진행 중인(끝나지 않았거나 오늘 이후에 끝나는) 소속 기간만 본다.
 * 합류일은 그 기간 안 이 팀 계약의 첫날(CL 에서 콜업되면 콜업일)이고, 없으면 기간 시작일이다.
 */
export function currentTenureStarts(
  members: readonly TeamMember[],
  today: LocalDate
): Map<string, LocalDate> {
  const starts = new Map<string, LocalDate>();
  for (const { tenure, teamStartDate } of members) {
    if (tenure.lastDay !== null && tenure.lastDay < today) continue;
    const start = teamStartDate ?? tenure.startDate;
    const known = starts.get(tenure.personId);
    if (known === undefined || known < start) starts.set(tenure.personId, start);
  }
  return starts;
}
