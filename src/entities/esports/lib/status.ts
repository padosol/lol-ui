import type { HiatusReason, LocalDate, PersonStatus, PersonStatusInfo } from "../types";

/** 현재 상태 패널의 보조 줄. 화면이 종류별 라벨을 붙인다. */
export type StatusDetail =
  /** date null = 만료일 미공개 */
  | { kind: "contractEnds"; date: LocalDate | null }
  | { kind: "inactive"; reason: HiatusReason | null }
  | { kind: "nextContract"; teamId: string; date: LocalDate | null }
  | { kind: "rights"; teamId: string; date: LocalDate | null };

/** 계약을 가진 상태 — 만료일이 비어 있으면 "미공개"로 보여야 한다(빠진 정보로 보이면 안 된다). */
const HOLDS_CONTRACT: readonly PersonStatus[] = ["CONTRACTED", "ON_LOAN"];

export function statusDetails(status: PersonStatusInfo): StatusDetail[] {
  const details: StatusDetail[] = [];
  if (status.contractLastDay !== null || HOLDS_CONTRACT.includes(status.status)) {
    details.push({ kind: "contractEnds", date: status.contractLastDay });
  }
  if (status.inactive) {
    details.push({ kind: "inactive", reason: status.inactiveReason });
  }
  if (status.nextTeamId) {
    details.push({ kind: "nextContract", teamId: status.nextTeamId, date: status.nextStartDate });
  }
  if (status.rightsTeamId) {
    details.push({ kind: "rights", teamId: status.rightsTeamId, date: status.rightsUntil });
  }
  return details;
}
