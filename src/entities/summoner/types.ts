export interface SummonerProfile {
  profileIconId: number;
  puuid: string;
  summonerLevel: number;
  gameName: string;
  tagLine: string;
  platform: string | null;
  lastRevisionDateTime: string | null;
  lastRevisionClickDateTime: string | null;
  point: number | null;
  tier: string | null;
  rank: string | null;
}

export interface SummonerAutocompleteItem {
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
}

export interface SummonerRenewalResponse {
  puuid: string;
  status: "SUCCESS" | "REQUEST" | "PROGRESS" | "FAILED";
}
