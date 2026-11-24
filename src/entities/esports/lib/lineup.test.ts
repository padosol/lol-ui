import { describe, expect, it } from "vitest";
import type { EsportsPosition, EsportsRole, RosterEntry, TeamMember } from "../types";
import { currentTenureStarts, splitStaff, startingLineup } from "./lineup";

function entry(
  personId: string,
  role: EsportsRole,
  position: EsportsPosition | null
): RosterEntry {
  return {
    personId,
    nickName: personId,
    imageUrl: null,
    nationality: "KR",
    role,
    position,
    contractType: "SIGN",
    startDate: "2025-11-18",
    lastDay: "2027-11-15",
    onLoan: false,
    loanFromTeamId: null,
    inactive: false,
    inactiveReason: null,
  };
}

function member(
  personId: string,
  tenure: { startDate: string; lastDay: string | null },
  teamStartDate: string | null
): TeamMember {
  return {
    tenure: {
      personId,
      nickName: personId,
      organizationId: "alpha",
      asPlayer: true,
      startDate: tenure.startDate,
      lastDay: tenure.lastDay,
      endReason: tenure.lastDay ? "EXPIRED" : null,
      contractCount: 1,
      renewalCount: 0,
      loan: false,
      roles: ["PLAYER"],
      teamIds: ["alpha"],
    },
    teamStartDate,
    teamLastDay: tenure.lastDay,
  };
}

describe("startingLineup", () => {
  it("포지션마다 응답 순서상 첫 선수를 주전으로, 같은 포지션 두 번째부터는 후보로 둔다", () => {
    const top = entry("bastion", "PLAYER", "TOP");
    const jgl = entry("cinder", "PLAYER", "JGL");
    const jgl2 = entry("rune", "PLAYER", "JGL");
    const mid = entry("arcturus", "PLAYER", "MID");

    const lineup = startingLineup([top, jgl, jgl2, mid]);

    expect(lineup.starters).toEqual({ TOP: top, JGL: jgl, MID: mid, AD: null, SPT: null });
    expect(lineup.subs).toEqual([jgl2]);
  });

  it("같은 포지션이면 활동 중단인 선수보다 활동 중인 선수가 주전이다", () => {
    const resting = { ...entry("arcturus", "PLAYER", "MID"), inactive: true, inactiveReason: "REST" as const };
    const playing = entry("rune", "PLAYER", "MID");

    const lineup = startingLineup([resting, playing]);

    expect(lineup.starters.MID).toBe(playing);
    expect(lineup.subs).toEqual([resting]);
  });

  it("재계약으로 계약 시작일이 늦어져도 이 팀에 먼저 합류한 선수가 주전이다", () => {
    // 서버 응답은 포지션 → 지금 계약 시작일 순이라 재계약한 주전이 뒤로 밀린다.
    const sub = { ...entry("rune", "PLAYER", "MID"), startDate: "2025-11-18" };
    const renewed = { ...entry("arcturus", "PLAYER", "MID"), startDate: "2026-11-17", contractType: "RENEWAL" as const };
    const joinDates = new Map([
      ["arcturus", "2023-11-21"],
      ["rune", "2025-11-18"],
    ]);

    const lineup = startingLineup([sub, renewed], joinDates);

    expect(lineup.starters.MID).toBe(renewed);
    expect(lineup.subs).toEqual([sub]);
  });

  it("포지션이 없는 선수는 후보로 둔다", () => {
    const noPosition = entry("mira", "PLAYER", null);

    expect(startingLineup([noPosition]).subs).toEqual([noPosition]);
  });
});

describe("splitStaff", () => {
  it("감독과 코치를 나눈다", () => {
    const echo = entry("echo", "HEAD_COACH", null);
    const sable = entry("sable", "COACH", null);
    const quill = entry("quill", "COACH", null);

    expect(splitStaff([echo, sable, quill])).toEqual({
      headCoaches: [echo],
      coaches: [sable, quill],
    });
  });
});

describe("currentTenureStarts", () => {
  const today = "2026-11-25";

  it("진행 중인 소속 기간이면 이 팀 첫날을 합류일로 쓴다", () => {
    const cinder = member("cinder", { startDate: "2025-11-18", lastDay: null }, "2026-06-01");

    expect(currentTenureStarts([cinder], today).get("cinder")).toBe("2026-06-01");
  });

  it("이 팀 첫날이 없으면 소속 기간 시작일을 쓴다", () => {
    const echo = member("echo", { startDate: "2024-11-19", lastDay: "2027-11-15" }, null);

    expect(currentTenureStarts([echo], today).get("echo")).toBe("2024-11-19");
  });

  it("이미 끝난 소속 기간은 넣지 않는다", () => {
    const dynamo = member("dynamo", { startDate: "2025-11-18", lastDay: "2026-11-16" }, "2025-11-18");

    expect(currentTenureStarts([dynamo], today).has("dynamo")).toBe(false);
  });

  it("한 사람에게 진행 중인 기간이 여럿이면 가장 늦게 시작한 것을 쓴다", () => {
    const older = member("lumen", { startDate: "2022-11-22", lastDay: null }, "2022-11-22");
    const newer = member("lumen", { startDate: "2025-11-18", lastDay: null }, "2025-11-18");

    expect(currentTenureStarts([older, newer], today).get("lumen")).toBe("2025-11-18");
  });
});
