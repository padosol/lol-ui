/**
 * Spectator API 응답 타입
 */

export interface SpectatorParticipant {
  puuid: string | null;
  teamId: 100 | 200;
  spell1Id: number;
  spell2Id: number;
  championId: number;
  lastSelectedSkinIndex: number;
  profileIconId: number;
  riotId: string;
  bot: boolean;
  gameCustomizationObjects: any[];
  perks: {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
  };
}

export interface SpectatorBannedChampion {
  championId: number;
  teamId: 100 | 200;
  pickTurn: number;
}

export interface SpectatorData {
  gameId: number;
  mapId: number;
  gameMode: string;
  gameType: string;
  gameQueueConfigId: number;
  participants: SpectatorParticipant[];
  observers: {
    encryptionKey: string;
  };
  platformId: string;
  bannedChampions: SpectatorBannedChampion[];
  gameStartTime: number;
  gameLength: number;
}

