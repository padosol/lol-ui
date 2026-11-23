import type { LeagueData, LeagueInfoResponse } from "@/entities/league";
import type { ChampionStat, RankChampionsResponse } from "@/entities/match";
import type { ChampionJson } from "@/shared/model/game-data";

export type CoverQueue = "solo" | "flex";

export interface MostChampion {
  stat: ChampionStat;
  queue: CoverQueue;
}

function mostPlayed(stats: ChampionStat[]): ChampionStat | null {
  return stats.reduce<ChampionStat | null>(
    (best, current) =>
      best === null || current.playCount > best.playCount ? current : best,
    null
  );
}

/**
 * 헤더 커버에 올릴 모스트 1 챔피언.
 * 솔로 랭크에서 게임 수가 가장 많은 챔피언, 솔로 기록이 없으면 자유 랭크에서 고른다.
 */
export function pickMostChampion(
  ranking: RankChampionsResponse | undefined
): MostChampion | null {
  const solo = mostPlayed(ranking?.solo ?? []);
  if (solo) return { stat: solo, queue: "solo" };

  const flex = mostPlayed(ranking?.flex ?? []);
  if (flex) return { stat: flex, queue: "flex" };

  return null;
}

/** 헤더에 보여줄 티어. 솔로 랭크, 없으면 자유 랭크. 둘 다 없으면 null(언랭크). */
export function pickCoverLeague(
  info: LeagueInfoResponse | undefined
): LeagueData | null {
  return info?.soloLeague ?? info?.flexLeague ?? null;
}

const APEX_TIERS = new Set(["MASTER", "GRANDMASTER", "CHALLENGER"]);

/** "EMERALD II". 마스터 이상은 단계가 없으므로(Riot 은 늘 "I") 티어만 쓴다. */
export function formatTierLabel(tier: string, rank: string): string {
  return APEX_TIERS.has(tier.toUpperCase()) ? tier : `${tier} ${rank}`;
}

/** 판당 평균 K/D/A 로 KDA 비율을 낸다. 데스가 0 이면 "perfect". */
export function calcKdaRatio(
  kills: number,
  deaths: number,
  assists: number
): string {
  if (deaths === 0) return "perfect";
  return ((kills + assists) / deaths).toFixed(2);
}

/**
 * 전적의 챔피언을 게임 데이터에서 찾아 이미지 id 와 표시 이름을 돌려준다.
 * 전적 API 의 championName 은 Data Dragon id 와 대소문자가 다른 경우가 있어(FiddleSticks)
 * championId(= 게임 데이터의 key)로 찾는다. 못 찾으면 championName 을 그대로 쓴다.
 */
export function resolveChampionAsset(
  championData: ChampionJson | null | undefined,
  stat: Pick<ChampionStat, "championId" | "championName">
): { assetId: string; name: string } {
  const key = String(stat.championId);
  const champion = championData
    ? Object.values(championData.data).find((c) => c.key === key)
    : undefined;

  return champion
    ? { assetId: champion.id, name: champion.name }
    : { assetId: stat.championName, name: stat.championName };
}
