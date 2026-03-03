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
  rank: string | null;
  leaguePoints: number;
  champions: string[];
}

export interface RankingResponse {
  content: RankingPlayer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface TierCutoff {
  id: number;
  queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  tier: "CHALLENGER" | "GRANDMASTER";
  platformId: string;
  minLeaguePoints: number;
  updatedAt: string;
  lpChange: number;
  userCount: number;
}

export type TierCutoffResponse = TierCutoff[];
