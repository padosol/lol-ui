import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getEsportsLeagues,
  getEsportsTeams,
  getLeagueSeasons,
  getTeamRoster,
  latestSeasonYear,
  pickLeague,
  publicLeagues,
  type TeamRoster,
} from "@/entities/esports";
import { serverApiClient } from "@/shared/api/server-client";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { EsportsTeamsPageClient } from "@/views/esports-teams";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ league?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.esportsTeams" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/esports"),
  };
}

export default async function EsportsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  const { league: requested } = await searchParams;

  const leagues = publicLeagues(await getEsportsLeagues(serverApiClient));
  const league = pickLeague(leagues, typeof requested === "string" ? requested : undefined);

  const [teams, seasons] = league
    ? await Promise.all([
        getEsportsTeams({ leagueId: league.leagueId }, serverApiClient),
        // 시즌은 머리글의 "2026 시즌" 에만 쓴다 — 실패해도 화면은 그린다.
        getLeagueSeasons(league.leagueId, serverApiClient).catch(() => []),
      ])
    : [[], []];

  // 팀 하나의 로스터가 실패해도 나머지 카드는 그린다.
  const results = await Promise.allSettled(teams.map((team) => getTeamRoster(team.teamId, serverApiClient)));
  const rosters: Record<string, TeamRoster | null> = Object.fromEntries(
    teams.map((team, index) => {
      const result = results[index];
      return [team.teamId, result.status === "fulfilled" ? result.value : null];
    })
  );

  return (
    <EsportsTeamsPageClient
      leagues={leagues}
      leagueId={league?.leagueId ?? null}
      teams={teams}
      rosters={rosters}
      seasonYear={latestSeasonYear(seasons)}
    />
  );
}
