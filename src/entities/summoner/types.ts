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

/** 갱신 요청(POST) 결과. 접수되면(이미 진행 중이어도) SUCCESS, 쿨다운에 걸리면 FAILED. */
export interface SummonerRenewalResponse {
  puuid: string;
  status: "SUCCESS" | "FAILED";
}

/** 갱신 상태(GET). 진행 중이면 PROGRESS, 아니면 SUCCESS. */
export interface SummonerRenewalStatusResponse {
  puuid: string;
  status: "PROGRESS" | "SUCCESS";
}
