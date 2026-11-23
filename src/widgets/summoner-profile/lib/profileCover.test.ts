import { describe, it, expect } from "vitest";
import type { LeagueData, LeagueInfoResponse } from "@/entities/league";
import type { ChampionStat, RankChampionsResponse } from "@/entities/match";
import type { ChampionJson } from "@/shared/model/game-data";
import {
  calcKdaRatio,
  formatTierLabel,
  pickCoverLeague,
  pickMostChampion,
  resolveChampionAsset,
} from "./profileCover";

function stat(overrides: Partial<ChampionStat>): ChampionStat {
  return {
    championId: 103,
    championName: "Ahri",
    playCount: 10,
    kills: 7.2,
    deaths: 3.1,
    assists: 8.4,
    win: 6,
    losses: 4,
    winRate: 60,
    damagePerMinute: 0,
    kda: 5.03,
    laneMinionsFirst10Minutes: 0,
    damageTakenOnTeamPercentage: 0,
    goldPerMinute: 0,
    ...overrides,
  };
}

function league(overrides: Partial<LeagueData>): LeagueData {
  return {
    leagueType: "RANKED_SOLO_5x5",
    leaguePoints: 54,
    wins: 112,
    losses: 98,
    oow: "53%",
    tier: "EMERALD",
    rank: "II",
    ...overrides,
  };
}

function leagueInfo(
  soloLeague: LeagueData | null,
  flexLeague: LeagueData | null
): LeagueInfoResponse {
  return { soloLeague, flexLeague, soloLeagueHistory: [], flexLeagueHistory: [] };
}

describe("pickMostChampion", () => {
  it("솔로 랭크에서 게임 수가 가장 많은 챔피언을 고른다", () => {
    const ranking: RankChampionsResponse = {
      solo: [
        stat({ championName: "Orianna", playCount: 22 }),
        stat({ championName: "Ahri", playCount: 48 }),
      ],
      flex: [stat({ championName: "Syndra", playCount: 90 })],
    };

    const most = pickMostChampion(ranking);

    expect(most?.stat.championName).toBe("Ahri");
    expect(most?.queue).toBe("solo");
  });

  it("솔로 기록이 없으면 자유 랭크 모스트를 쓴다", () => {
    const ranking: RankChampionsResponse = {
      solo: [],
      flex: [stat({ championName: "Syndra", playCount: 15 })],
    };

    const most = pickMostChampion(ranking);

    expect(most?.stat.championName).toBe("Syndra");
    expect(most?.queue).toBe("flex");
  });

  it.each([
    ["두 큐 모두 비었다", { solo: [], flex: [] }],
    ["응답이 아직 없다", undefined],
  ])("%s → null", (_label, ranking) => {
    expect(pickMostChampion(ranking)).toBeNull();
  });
});

describe("pickCoverLeague", () => {
  it("솔로 랭크를 먼저 보여준다", () => {
    const solo = league({ tier: "EMERALD" });
    const flex = league({ leagueType: "RANKED_FLEX_SR", tier: "DIAMOND" });

    expect(pickCoverLeague(leagueInfo(solo, flex))).toBe(solo);
  });

  it("솔로가 없으면 자유 랭크를 보여준다", () => {
    const flex = league({ leagueType: "RANKED_FLEX_SR", tier: "DIAMOND" });

    expect(pickCoverLeague(leagueInfo(null, flex))).toBe(flex);
  });

  it.each([
    ["두 큐 모두 배치 전이다", leagueInfo(null, null)],
    ["응답이 아직 없다", undefined],
  ])("%s → null", (_label, info) => {
    expect(pickCoverLeague(info)).toBeNull();
  });
});

describe("formatTierLabel", () => {
  it("일반 티어는 단계를 붙인다", () => {
    expect(formatTierLabel("EMERALD", "II")).toBe("EMERALD II");
  });

  it.each(["MASTER", "GRANDMASTER", "CHALLENGER"])(
    "%s 는 단계 없이 쓴다 (Riot 이 늘 I 로 내려준다)",
    (tier) => {
      expect(formatTierLabel(tier, "I")).toBe(tier);
    }
  );
});

describe("calcKdaRatio", () => {
  it("(킬+어시)/데스 를 소수 둘째 자리까지 낸다", () => {
    expect(calcKdaRatio(7.2, 3.1, 8.4)).toBe("5.03");
  });

  it("데스가 0 이면 perfect", () => {
    expect(calcKdaRatio(5, 0, 3)).toBe("perfect");
  });
});

describe("resolveChampionAsset", () => {
  const championData = {
    data: {
      Fiddlesticks: { id: "Fiddlesticks", key: "9", name: "피들스틱" },
      Ahri: { id: "Ahri", key: "103", name: "아리" },
    },
  } as unknown as ChampionJson;

  it("championId 로 게임 데이터의 이미지 id 와 표시 이름을 찾는다", () => {
    // 전적 API 는 FiddleSticks 로 내려주지만 Data Dragon 이미지 id 는 Fiddlesticks 다.
    const resolved = resolveChampionAsset(
      championData,
      stat({ championId: 9, championName: "FiddleSticks" })
    );

    expect(resolved).toEqual({ assetId: "Fiddlesticks", name: "피들스틱" });
  });

  it("게임 데이터를 아직 못 받았으면 전적의 영문 이름을 그대로 쓴다", () => {
    expect(resolveChampionAsset(null, stat({ championName: "Ahri" }))).toEqual({
      assetId: "Ahri",
      name: "Ahri",
    });
  });
});
