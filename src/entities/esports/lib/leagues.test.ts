import { describe, expect, it } from "vitest";
import type { EsportsLeague, EsportsSeason } from "../types";
import { latestSeasonYear, leagueLabel, pickLeague, publicLeagues } from "./leagues";

function league(leagueId: string, over: Partial<EsportsLeague> = {}): EsportsLeague {
  return {
    leagueId,
    name: leagueId.toUpperCase(),
    nameAcronym: null,
    region: "KR",
    international: false,
    imageUrl: null,
    darkImageUrl: null,
    sortOrder: 1,
    active: true,
    ...over,
  };
}

function season(year: number | null, startDate: string | null): EsportsSeason {
  return {
    seasonId: `s${year}`,
    leagueId: "lck",
    name: `LCK ${year}`,
    nameAcronym: null,
    year,
    startDate,
    endDate: null,
    sortOrder: 1,
  };
}

describe("publicLeagues", () => {
  it("운영 중인 지역 리그만 sortOrder 순으로 남긴다", () => {
    const lck = league("lck", { sortOrder: 1 });
    const cl = league("lck_cl", { sortOrder: 2 });
    const worlds = league("worlds", { international: true });
    const closed = league("old", { active: false });

    expect(publicLeagues([cl, worlds, lck, closed])).toEqual([lck, cl]);
  });
});

describe("pickLeague", () => {
  const lck = league("lck");
  const cl = league("lck_cl", { sortOrder: 2 });

  it("요청한 리그가 목록에 있으면 그 리그다", () => {
    expect(pickLeague([lck, cl], "lck_cl")).toBe(cl);
  });

  it("없는 리그나 미지정이면 첫 리그다", () => {
    expect(pickLeague([lck, cl], "worlds")).toBe(lck);
    expect(pickLeague([lck, cl], undefined)).toBe(lck);
  });

  it("리그가 하나도 없으면 null 이다", () => {
    expect(pickLeague([], "lck")).toBeNull();
  });
});

describe("leagueLabel", () => {
  it("약칭이 있으면 약칭, 없으면 이름이다", () => {
    expect(leagueLabel(league("lck_cl", { name: "LCK Challengers League", nameAcronym: "LCK CL" }))).toBe("LCK CL");
    expect(leagueLabel(league("lck", { name: "LCK" }))).toBe("LCK");
  });
});

describe("latestSeasonYear", () => {
  it("응답 순서(시작일 내림차순)상 연도가 있는 첫 시즌의 연도다", () => {
    expect(latestSeasonYear([season(null, null), season(2026, "2026-01-14"), season(2025, "2025-01-15")])).toBe(2026);
  });

  it("시즌이 없으면 null 이다", () => {
    expect(latestSeasonYear([])).toBeNull();
  });
});
