export interface SpectatorParticipant {
  summonerName: string;
  riotId?: string;
  puuid: string;
  championId: number;
  teamId: number;
  spell1Id: number;
  spell2Id: number;
  isBot?: boolean;
  perks: {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
  };
}

export interface SpectatorBannedChampion {
  championId: number;
  teamId: number;
  pickTurn: number;
}

export interface SpectatorData {
  gameId: number;
  mapId: number;
  gameMode: string;
  gameType: string;
  gameQueueConfigId: number;
  participants: SpectatorParticipant[];
  bannedChampions: SpectatorBannedChampion[];
  gameStartTime: number;
  gameLength: number;
}

export interface QueueTab {
  queueId: number;
  queueName: string;
}
