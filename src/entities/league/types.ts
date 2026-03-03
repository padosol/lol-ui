export interface LeagueData {
  leagueType: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  oow: string;
  tier: string;
  rank: string;
}

export interface LeagueInfoResponse {
  soloLeague: LeagueData | null;
  flexLeague: LeagueData | null;
  soloLeagueHistory: LeagueData[];
  flexLeagueHistory: LeagueData[];
}
