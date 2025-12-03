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
  myData: ParticipantData;
  gameInfoData: GameInfoData;
  participantData: ParticipantData[];
  teamInfoData: {
    [key: string]: TeamInfo;
  };
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
  item: any | null;
  summoner1Id: number;
  summoner2Id: number;
  itemsPurchased: number;
  participantId: number;
  statValue: any | null;
  style: any | null;
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
  itemSeq: any | null;
  skillSeq: any | null;
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
  championId: number[];
  pickTurn: number[];
}

// 챔피언 통계 타입 (문서 기준)
export interface ChampionStat {
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number | null;
  duration: number | null;
  win: number;
  playCount: number;
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

// 챔피언 로테이션 응답 타입
export interface ChampionRotationResponse {
  maxNewPlayerLevel: number;
  freeChampionIdsForNewPlayers: number[];
  freeChampionIds: number[];
}
