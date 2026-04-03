import type { MatchDetail } from "@/entities/match";

export interface TeammateStats {
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string | null;
  summonerName: string;
  profileIcon: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number | "perfect";
}

interface TeammateAccumulator {
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string | null;
  summonerName: string;
  profileIcon: number;
  gamesPlayed: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
}

export function aggregateTeammates(
  matches: MatchDetail[],
  myPuuid: string,
): TeammateStats[] {
  const map = new Map<string, TeammateAccumulator>();

  for (const match of matches) {
    const participants = match.participantData;
    if (!participants?.length) continue;

    const me =
      match.myData ??
      participants.find((p) => p.puuid === myPuuid);
    if (!me) continue;

    const myTeamId = me.teamId;

    for (const p of participants) {
      if (!p.puuid || p.puuid === myPuuid) continue;
      if (p.teamId !== myTeamId) continue;

      const existing = map.get(p.puuid);
      if (existing) {
        existing.gamesPlayed++;
        if (p.win) existing.wins++;
        existing.kills += p.kills;
        existing.deaths += p.deaths;
        existing.assists += p.assists;
        existing.riotIdGameName = p.riotIdGameName ?? existing.riotIdGameName;
        existing.riotIdTagline = p.riotIdTagline ?? existing.riotIdTagline;
        existing.summonerName = p.summonerName || existing.summonerName;
        existing.profileIcon = p.profileIcon || existing.profileIcon;
      } else {
        map.set(p.puuid, {
          puuid: p.puuid,
          riotIdGameName: p.riotIdGameName ?? p.summonerName,
          riotIdTagline: p.riotIdTagline,
          summonerName: p.summonerName,
          profileIcon: p.profileIcon,
          gamesPlayed: 1,
          wins: p.win ? 1 : 0,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
        });
      }
    }
  }

  return Array.from(map.values())
    .filter((t) => t.gamesPlayed >= 2)
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5)
    .map((t) => {
      const kda: number | "perfect" =
        t.deaths === 0
          ? "perfect"
          : parseFloat(((t.kills + t.assists) / t.deaths).toFixed(2));

      return {
        puuid: t.puuid,
        riotIdGameName: t.riotIdGameName,
        riotIdTagline: t.riotIdTagline,
        summonerName: t.summonerName,
        profileIcon: t.profileIcon,
        gamesPlayed: t.gamesPlayed,
        wins: t.wins,
        losses: t.gamesPlayed - t.wins,
        kills: t.kills,
        deaths: t.deaths,
        assists: t.assists,
        kda,
      };
    });
}
