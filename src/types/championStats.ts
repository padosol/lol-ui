export type PositionType = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

export interface MatchupData {
  opponentChampionId: number;
  totalGames: number;
  totalWins: number;
  totalWinRate: number;
}

export interface ItemBuildData {
  itemsSorted: string; // "3078,3053,3065"
  totalGames: number;
  totalWins: number;
  totalWinRate: number;
}

export interface RuneBuildData {
  primaryStyleId: number;
  primaryPerkIds: string; // "8010,9111,9104,8299"
  subStyleId: number;
  subPerkIds: string; // "8446,8451"
  totalGames: number;
  totalWins: number;
  totalWinRate: number;
}

export interface SkillBuildData {
  skillOrder15: string; // "Q,E,W,Q,Q,R,Q,E,Q,E,R,E,E,W,W"
  totalGames: number;
  totalWins: number;
  totalWinRate: number;
}

export interface ChampionPositionStats {
  teamPosition: string;
  winRate: number;
  totalCount: number;
  matchups: MatchupData[];
  itemBuilds: ItemBuildData[];
  runeBuilds: RuneBuildData[];
  skillBuilds: SkillBuildData[];
}

export interface ChampionStatsResponse {
  tier: string;
  stats: ChampionPositionStats[];
}
