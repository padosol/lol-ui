import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  esportsTeamHref,
  getEsportsLeagues,
  getLeagueSeasons,
  getTeamDetail,
  getTeamMembers,
  getTeamRoster,
  latestSeasonYear,
} from "@/entities/esports";
import { getApiErrorStatus } from "@/shared/api/error";
import { serverApiClient } from "@/shared/api/server-client";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { EsportsTeamPageClient } from "@/views/esports-team";

const getCachedTeamDetail = cache((teamId: string) => getTeamDetail(teamId, serverApiClient));

interface PageProps {
  params: Promise<{ locale: string; teamId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, teamId: rawTeamId } = await params;
  const teamId = decodeURIComponent(rawTeamId);
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.esportsTeam" });
  const alternates = localeAlternates(locale, esportsTeamHref(teamId));
  const name = await getCachedTeamDetail(teamId)
    .then((detail) => detail.team.name)
    .catch(() => teamId);
  return {
    title: t("title", { name }),
    description: t("description", { name }),
    alternates,
  };
}

export default async function EsportsTeamPage({ params }: PageProps) {
  const { locale, teamId: rawTeamId } = await params;
  setRequestLocale(toLocale(locale));
  const teamId = decodeURIComponent(rawTeamId);

  const detail = await getCachedTeamDetail(teamId).catch((error: unknown) => {
    if (getApiErrorStatus(error) === 404) notFound();
    throw error;
  });

  const homeLeagueId = detail.team.homeLeagueId;
  const [roster, members, leagues, seasons] = await Promise.all([
    getTeamRoster(teamId, serverApiClient),
    // 아래 셋은 보조 정보라 실패해도 화면을 그린다(합류일·리그 이름·시즌 연도가 빠질 뿐).
    getTeamMembers(teamId, serverApiClient).catch(() => []),
    getEsportsLeagues(serverApiClient).catch(() => []),
    homeLeagueId ? getLeagueSeasons(homeLeagueId, serverApiClient).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <EsportsTeamPageClient
      detail={detail}
      roster={roster}
      members={members}
      leagues={leagues}
      seasonYear={latestSeasonYear(seasons)}
    />
  );
}
