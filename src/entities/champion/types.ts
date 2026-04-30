export interface ChampionRotationResponse {
  maxNewPlayerLevel: number;
  freeChampionIdsForNewPlayers: number[];
  freeChampionIds: number[];
}

export type PositionType = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

export type ApiPositionType = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export interface MatchupData {
  opponentChampionId: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface ItemBuildData {
  itemBuild: string; // "3078,3053,3065"
  games: number;
  winRate: number;
  pickRate: number;
}

export interface StartItemBuildData {
  startItems: string; // "1054,2003"
  games: number;
  winRate: number;
  pickRate: number;
}

export interface BootBuildData {
  bootId: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface RuneBuildData {
  primaryStyleId: number;
  subStyleId: number;
  primaryPerk0: number;
  primaryPerk1: number;
  primaryPerk2: number;
  primaryPerk3: number;
  subPerk0: number;
  subPerk1: number;
  statPerkDefense: number;
  statPerkFlex: number;
  statPerkOffense: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface SkillBuildData {
  skillBuild: string; // "Q,E,W,Q,Q,R,Q,E,Q,E,R,E,E,W,W"
  games: number;
  winRate: number;
  pickRate: number;
}

export interface SpellStatsData {
  summoner1Id: number;
  summoner2Id: number;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface ItemStatByOrder {
  itemId: number;
  itemName: string;
  games: number;
  winRate: number;
  pickRate: number;
}

export interface ChampionPositionStats {
  teamPosition: ApiPositionType;
  winRate: number;
  totalGames: number;
  matchups: MatchupData[];
  itemBuilds: ItemBuildData[];
  startItemBuilds: StartItemBuildData[];
  bootBuilds: BootBuildData[];
  runeBuilds: RuneBuildData[];
  skillBuilds: SkillBuildData[];
  spellStats: SpellStatsData[];
  itemStatsByOrder: Record<string, ItemStatByOrder[]>;
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
