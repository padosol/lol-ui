export interface ChampionRotationResponse {
  maxNewPlayerLevel: number;
  freeChampionIdsForNewPlayers: number[];
  freeChampionIds: number[];
}

export type PositionType = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

export type ApiPositionType = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export interface MatchupData {
  rankType: "TOP" | "BOTTOM"; // TOP=잘 잡는 상대, BOTTOM=카운터
  opponentChampionId: number;
  games: number;
  winRate: number;
  pickRate: number;
}

// 모든 빌드 타입 공통 신뢰도 메타 (server M2 도입).
// games 와 sampleSize 는 동일값이지만 sampleSize 가 의미명 명확.
export interface BuildConfidenceMeta {
  sampleSize?: number;
  totalSampleSize?: number;
  confidenceLowerBound?: number; // Wilson 95% lower bound, 0~1
}

export interface ItemBuildData extends BuildConfidenceMeta {
  itemBuild: number[]; // [3078, 3053, 3065]
  games: number;
  winRate: number;
  pickRate: number;
}

export interface StartItemBuildData extends BuildConfidenceMeta {
  startItems: number[]; // [1054, 2003]
  games: number;
  winRate: number;
  pickRate: number;
}

export interface BootBuildData extends BuildConfidenceMeta {
  bootId: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface RuneBuildData extends BuildConfidenceMeta {
  primaryStyleId: number;
  subStyleId: number;
  primaryPerk0: number;
  primaryPerk1: number;
  primaryPerk2: number;
  primaryPerk3: number;
  subPerk0: number;
  subPerk1: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface SkillBuildData extends BuildConfidenceMeta {
  skillBuild: string | null; // BQ: "[1,2,1,2,2,3,...]" / 레거시: "Q,E,W,Q,Q,R,..." / null: 데이터 부족
  games: number;
  winRate: number;
  pickRate: number;
}

export interface SpellStatsData extends BuildConfidenceMeta {
  summoner1Id: number;
  summoner2Id: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface ChampionAverageStats {
  teamPosition: string;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  avgGoldPerMinute: number;
  avgLaneCs10m: number;
  avgJungleCs10m: number;
}

export interface ChampionPositionStats {
  teamPosition: ApiPositionType;
  winRate: number;
  totalGames: number;
  pickRate?: number;
  banRate?: number;
  tier?: string;
  averages?: ChampionAverageStats | null;
  matchups: MatchupData[];
  itemBuilds: ItemBuildData[];
  startItemBuilds: StartItemBuildData[];
  bootBuilds: BootBuildData[];
  runeBuilds: RuneBuildData[];
  skillBuilds: SkillBuildData[];
  spellStats: SpellStatsData[];
}

export interface ChampionStatsResponse {
  tier: string;
  positions: ChampionPositionStats[];
}

export interface PositionChampionEntry {
  championId: number;
  tier: string;
  winRate: number;
  pickRate: number;
  banRate: number;
}

export interface PositionChampionStats {
  teamPosition: ApiPositionType;
  champions: PositionChampionEntry[];
}
