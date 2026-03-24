export interface Match {
  id: string;
  champion: string;
  championIcon: string;
  result: "WIN" | "LOSS" | "REMAKE";
  gameMode: string;
  position: string;
  kda: {
    kills: number;
    deaths: number;
    assists: number;
  };
  gameDuration: number;
  gameDate: string;
  gameTimestamp: number;
  items: number[];
}

export interface MatchDetail {
  myData?: ParticipantData;
  gameInfoData: GameInfoData;
  participantData: ParticipantData[];
  teamInfoData: {
    blueTeam: TeamInfo;
    redTeam: TeamInfo;
  };
}

export interface ItemSeqEntry {
  itemId: number;
  minute: number;
  type: string;
}

export interface SkillSeqEntry {
  skillSlot: number;
  minute: number;
  type: string;
}

export interface ParticipantData {
  summonerName: string;
  profileIcon: number;
  riotIdGameName: string | null;
  riotIdTagline: string | null;
  puuid: string | null;
  summonerLevel: number;
  summonerId: string | null;
  individualPosition: string | null;
  kills: number;
  deaths: number;
  assists: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string;
  consumablesPurchased: number;
  goldEarned: number;
  item: ItemData | number[] | null;
  summoner1Id: number;
  summoner2Id: number;
  itemsPurchased: number;
  participantId: number;
  statValue: StatValue | null;
  style: RuneStyle | string | null;
  visionScore: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  kda: number;
  teamDamagePercentage: number;
  goldPerMinute: number;
  killParticipation: number;
  teamId: number;
  teamPosition: string | null;
  win: boolean;
  timePlayed: number;
  timeCCingOthers: number;
  lane: string | null;
  role: string | null;
  placement: number;
  playerAugment1: number;
  playerAugment2: number;
  playerAugment3: number;
  playerAugment4: number;
  itemSeq: ItemSeqEntry[] | null;
  skillSeq: SkillSeqEntry[] | null;
  tier?: string | null;
  tierRank?: string | null;
  absolutePoints?: number;
}

export interface GameInfoData {
  dataVersion: string | null;
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameMode: string;
  gameStartTimestamp: number;
  gameType: string | null;
  gameVersion: string | null;
  mapId: number;
  platformId: string | null;
  queueId: number;
  tournamentCode: string | null;
  matchId: string | null;
  averageTier: string | null;
  averageRank: string | null;
}

export interface TeamInfo {
  teamId: number;
  win: boolean;
  championKills: number;
  baronKills: number;
  dragonKills: number;
  towerKills: number;
  inhibitorKills: number;
  championId: number[];
  pickTurn: number[];
}

export interface ChampionStat {
  championId: number;
  championName: string;
  playCount: number;
  kills: number;
  deaths: number;
  assists: number;
  win: number;
  losses: number;
  winRate: number;
  damagePerMinute: number;
  kda: number;
  laneMinionsFirst10Minutes: number;
  damageTakenOnTeamPercentage: number;
  goldPerMinute: number;
  cs?: number | null;
  duration?: number | null;
}

export interface ItemData {
  item0?: number;
  item1?: number;
  item2?: number;
  item3?: number;
  item4?: number;
  item5?: number;
  item6?: number;
}

export interface RuneSelection {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

export interface RuneStyleEntry {
  style: number;
  selections: RuneSelection[];
}

export interface RuneStyle {
  styles: RuneStyleEntry[];
  primaryRuneId?: number;
  primaryRuneIds?: number[];
  secondaryRuneId?: number;
  secondaryRuneIds?: number[];
  primaryStyleId?: number;
  primaryPerk0?: number;
  primaryPerk1?: number;
  primaryPerk2?: number;
  primaryPerk3?: number;
  subStyleId?: number;
  subPerk0?: number;
  subPerk1?: number;
}

export interface StatValue {
  [key: string]: number | string;
}

export interface MatchIdsResponse {
  content: string[];
  hasNext: boolean;
}

export interface SummonerMatchesResponse {
  content: MatchDetail[];
  hasNext: boolean;
}

export interface DailyMatchCount {
  gameDate: string;
  gameCount: number;
}

export interface DailyMatchCountResponse {
  dailyCounts: DailyMatchCount[];
  minCount: number;
  maxCount: number;
}
