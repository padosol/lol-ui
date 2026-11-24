import { describe, expect, it } from "vitest";
import type { PersonStatusInfo } from "../types";
import { statusDetails } from "./status";

function status(over: Partial<PersonStatusInfo>): PersonStatusInfo {
  return {
    status: "CONTRACTED",
    teamId: "alpha",
    contractTeamId: "alpha",
    role: "PLAYER",
    position: "MID",
    contractLastDay: "2028-11-20",
    inactive: false,
    inactiveReason: null,
    retiredAsPlayer: false,
    nextTeamId: null,
    nextStartDate: null,
    rightsTeamId: null,
    rightsUntil: null,
    ...over,
  };
}

describe("statusDetails", () => {
  it("계약 중이면 계약 만료일을 보여준다", () => {
    expect(statusDetails(status({}))).toEqual([{ kind: "contractEnds", date: "2028-11-20" }]);
  });

  it("계약 중인데 만료일이 비공개면 '미공개' 줄로 남긴다", () => {
    expect(statusDetails(status({ contractLastDay: null }))).toEqual([{ kind: "contractEnds", date: null }]);
  });

  it("FA 는 만료일 줄이 없고, 확정된 다음 계약을 보여준다", () => {
    const fa = status({
      status: "FREE_AGENT",
      teamId: null,
      contractTeamId: null,
      role: null,
      position: null,
      contractLastDay: null,
      nextTeamId: "charlie",
      nextStartDate: "2026-12-01",
    });

    expect(statusDetails(fa)).toEqual([{ kind: "nextContract", teamId: "charlie", date: "2026-12-01" }]);
  });

  it("활동 중단 사유와 계약 중 은퇴 권리를 함께 보여준다", () => {
    const retired = status({
      status: "RETIRED",
      teamId: null,
      contractLastDay: null,
      inactive: true,
      inactiveReason: "MILITARY",
      rightsTeamId: "charlie",
      rightsUntil: "2027-11-15",
    });

    expect(statusDetails(retired)).toEqual([
      { kind: "inactive", reason: "MILITARY" },
      { kind: "rights", teamId: "charlie", date: "2027-11-15" },
    ]);
  });
});
