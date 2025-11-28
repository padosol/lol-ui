import type { ApiResponse } from "@/types/api";
import { apiClient } from "./client";

/**
 * 예시: 실제 백엔드 API 문서를 참고하여 작성한 API 함수
 *
 * 백엔드 API 문서: http://localhost:63342/lol-server/lol-server.core.core-api/build/docs/asciidoc/index.html
 *
 * 이 파일은 실제 백엔드 API 엔드포인트에 맞게 수정해야 합니다.
 */

// 예시: 소환사 정보 조회 (실제 API 구조에 맞게 수정 필요)
export interface SummonerInfoResponse {
  summonerId: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

/**
 * 소환사 기본 정보 조회
 * GET /api/v1/summoner/by-name/{summonerName}
 *
 * @param summonerName 소환사 이름
 * @param region 리전 (예: "kr", "na1", "euw1")
 * @returns 소환사 기본 정보
 */
export async function getSummonerByName(
  summonerName: string,
  region: string = "kr"
): Promise<SummonerInfoResponse> {
  const response = await apiClient.get<ApiResponse<SummonerInfoResponse>>(
    `/api/v1/summoner/by-name/${encodeURIComponent(summonerName)}`,
    {
      params: {
        region,
      },
    }
  );
  return response.data.data;
}

/**
 * 소환사 랭크 정보 조회
 * GET /api/v1/league/by-summoner/{summonerId}
 *
 * @param summonerId 소환사 ID
 * @returns 랭크 정보 배열
 */
export interface LeagueEntryResponse {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export async function getLeagueEntriesBySummoner(
  summonerId: string
): Promise<LeagueEntryResponse[]> {
  const response = await apiClient.get<ApiResponse<LeagueEntryResponse[]>>(
    `/api/v1/league/by-summoner/${summonerId}`
  );
  return response.data.data;
}

/**
 * 매치 리스트 조회
 * GET /api/v1/match/by-puuid/{puuid}/ids
 *
 * @param puuid 소환사 PUUID
 * @param start 시작 인덱스 (기본값: 0)
 * @param count 조회할 매치 수 (기본값: 20, 최대: 100)
 * @returns 매치 ID 배열
 */
export async function getMatchIdsByPuuid(
  puuid: string,
  start: number = 0,
  count: number = 20
): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    `/api/v1/match/by-puuid/${puuid}/ids`,
    {
      params: {
        start,
        count,
      },
    }
  );
  return response.data.data;
}

/**
 * 매치 상세 정보 조회
 * GET /api/v1/match/{matchId}
 *
 * @param matchId 매치 ID
 * @returns 매치 상세 정보
 */
export interface MatchDetailResponse {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: Array<{
      assists: number;
      baronKills: number;
      bountyLevel: number;
      champExperience: number;
      champLevel: number;
      championId: number;
      championName: string;
      damageDealtToBuildings: number;
      damageDealtToObjectives: number;
      damageDealtToTurrets: number;
      damageSelfMitigated: number;
      deaths: number;
      detectorWardsPlaced: number;
      doubleKills: number;
      dragonKills: number;
      firstBloodAssist: boolean;
      firstBloodKill: boolean;
      firstTowerAssist: boolean;
      firstTowerKill: boolean;
      gameEndedInEarlySurrender: boolean;
      gameEndedInSurrender: boolean;
      goldEarned: number;
      goldSpent: number;
      individualPosition: string;
      inhibitorKills: number;
      inhibitorTakedowns: number;
      inhibitorsLost: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      itemsPurchased: number;
      killingSprees: number;
      kills: number;
      lane: string;
      largestCriticalStrike: number;
      largestKillingSpree: number;
      largestMultiKill: number;
      longestTimeSpentLiving: number;
      magicDamageDealt: number;
      magicDamageDealtToChampions: number;
      magicDamageTaken: number;
      neutralMinionsKilled: number;
      nexusKills: number;
      nexusLost: number;
      nexusTakedowns: number;
      objectivesStolen: number;
      objectivesStolenAssists: number;
      participantId: number;
      pentaKills: number;
      perks: {
        statPerks: {
          defense: number;
          flex: number;
          offense: number;
        };
        styles: Array<{
          description: string;
          selections: Array<{
            perk: number;
            var1: number;
            var2: number;
            var3: number;
          }>;
          style: number;
        }>;
      };
      physicalDamageDealt: number;
      physicalDamageDealtToChampions: number;
      physicalDamageTaken: number;
      profileIcon: number;
      puuid: string;
      quadraKills: number;
      riotIdName: string;
      riotIdTagline: string;
      role: string;
      sightWardsBoughtInGame: number;
      spell1Casts: number;
      spell2Casts: number;
      spell3Casts: number;
      spell4Casts: number;
      summoner1Casts: number;
      summoner1Id: number;
      summoner2Casts: number;
      summoner2Id: number;
      summonerId: string;
      summonerLevel: number;
      summonerName: string;
      teamEarlySurrendered: boolean;
      teamId: number;
      teamPosition: string;
      timeCCingOthers: number;
      timePlayed: number;
      totalDamageDealt: number;
      totalDamageDealtToChampions: number;
      totalDamageShieldedOnTeammates: number;
      totalDamageTaken: number;
      totalHeal: number;
      totalHealsOnTeammates: number;
      totalMinionsKilled: number;
      totalTimeCCDealt: number;
      totalTimeSpentDead: number;
      totalUnitsHealed: number;
      tripleKills: number;
      trueDamageDealt: number;
      trueDamageDealtToChampions: number;
      trueDamageTaken: number;
      turretKills: number;
      turretTakedowns: number;
      turretsLost: number;
      unrealKills: number;
      visionScore: number;
      visionWardsBoughtInGame: number;
      wardsKilled: number;
      wardsPlaced: number;
      win: boolean;
    }>;
    platformId: string;
    queueId: number;
    teams: Array<{
      bans: Array<{
        championId: number;
        pickTurn: number;
      }>;
      objectives: {
        baron: {
          first: boolean;
          kills: number;
        };
        champion: {
          first: boolean;
          kills: number;
        };
        dragon: {
          first: boolean;
          kills: number;
        };
        inhibitor: {
          first: boolean;
          kills: number;
        };
        riftHerald: {
          first: boolean;
          kills: number;
        };
        tower: {
          first: boolean;
          kills: number;
        };
      };
      teamId: number;
      win: boolean;
    }>;
    tournamentCode: string;
  };
}

export async function getMatchDetail(
  matchId: string
): Promise<MatchDetailResponse> {
  const response = await apiClient.get<ApiResponse<MatchDetailResponse>>(
    `/api/v1/match/${matchId}`
  );
  return response.data.data;
}

/**
 * 챔피언 마스터리 조회
 * GET /api/v1/champion-mastery/by-summoner/{summonerId}
 *
 * @param summonerId 소환사 ID
 * @returns 챔피언 마스터리 배열
 */
export interface ChampionMasteryResponse {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

export async function getChampionMasteries(
  summonerId: string
): Promise<ChampionMasteryResponse[]> {
  const response = await apiClient.get<ApiResponse<ChampionMasteryResponse[]>>(
    `/api/v1/champion-mastery/by-summoner/${summonerId}`
  );
  return response.data.data;
}
