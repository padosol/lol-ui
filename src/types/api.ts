// API 응답 래퍼 타입 (문서 기준)
export interface ApiResponse<T> {
  result: "SUCCESS" | "FAIL";
  data: T;
  errorMessage: string | null;
}

// 소환사 프로필 타입 (문서 기준)
export interface SummonerProfile {
  profileIconId: number;
  puuid: string;
  summonerLevel: number;
  gameName: string;
  tagLine: string;
  platform: string | null;
  lastRevisionDateTime: string | null;
  point: number | null;
  tier: string | null;
  rank: string | null;
}

// 소환사 자동완성 응답 타입
export interface SummonerAutocompleteItem {
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
}

// 소환사 갱신 응답 타입
export interface SummonerRenewalResponse {
  puuid: string;
  status: "SUCCESS" | "REQUEST" | "PROGRESS" | "FAILED";
}

// 매치 타입
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
  items: number[];
}

// 매치 상세 정보 타입 (문서 기준)
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
}

export interface GameInfoData {
  dateVersion: string | null;
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

// 챔피언 통계 타입 (문서 기준)
export interface ChampionStat {
  championId: number;
  championName: string;
  playCount: number;
  // averages
  kills: number;
  deaths: number;
  assists: number;

  // results
  win: number;
  losses?: number;
  winRate?: number;

  // advanced stats (docs)
  damagePerMinute?: number;
  kda?: number;
  laneMinionsFirst10Minutes?: number;
  damageTakenOnTeamPercentage?: number;
  goldPerMinute?: number;

  // UI legacy fields (some screens still render these)
  cs?: number | null;
  duration?: number | null;
}

// 리그 정보 타입 (문서 기준)
export interface LeagueData {
  leagueType: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  oow: string;
  tier: string;
  rank: string;
}

// 리그 정보 응답 타입 (새로운 API 스펙)
export interface LeagueInfoResponse {
  soloLeague: LeagueData | null;
  flexLeague: LeagueData | null;
  soloLeagueHistory: LeagueData[];
  flexLeagueHistory: LeagueData[];
}

// API 에러 타입
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 아이템 데이터 타입
export interface ItemData {
  item0?: number;
  item1?: number;
  item2?: number;
  item3?: number;
  item4?: number;
  item5?: number;
  item6?: number;
}

// 룬 스타일 타입
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
}

// 스탯 값 타입
export interface StatValue {
  [key: string]: number | string;
}

// 챔피언 로테이션 응답 타입
export interface ChampionRotationResponse {
  maxNewPlayerLevel: number;
  freeChampionIdsForNewPlayers: number[];
  freeChampionIds: number[];
}

// 매치 ID 목록 응답 타입 (문서 기준)
export interface MatchIdsResponse {
  content: string[];
  hasNext: boolean;
}

// 소환사 매치 배치 조회 응답 타입
export interface SummonerMatchesResponse {
  content: MatchDetail[];
  hasNext: boolean;
}

// 랭킹 플레이어 타입
export interface RankingPlayer {
  puuid: string;
  currentRank: number;
  rankChange: number;
  gameName: string;
  tagLine: string;
  wins: number;
  losses: number;
  winRate: number;
  tier: string;
  rank: string | null; // 티어 내 단계 (I, II, III, IV)
  leaguePoints: number;
  champions: string[];
}

// 랭킹 응답 타입 (페이지네이션 포함)
export interface RankingResponse {
  content: RankingPlayer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

// 티어 커트오프 항목
export interface TierCutoff {
  id: number;
  queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  tier: "CHALLENGER" | "GRANDMASTER";
  region: string;
  minLeaguePoints: number;
  updatedAt: string;
  lpChange?: number; // LP 변동값
  userCount?: number; // 유저 수
}

// 티어 커트오프 응답 (배열)
export type TierCutoffResponse = TierCutoff[];
