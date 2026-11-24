import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  esportsPersonHref,
  getEsportsLeagues,
  getEsportsTeams,
  getPersonCareer,
  getPersonProfile,
  getTeamRoster,
  type PersonCareer,
} from "@/entities/esports";
import { getApiErrorStatus } from "@/shared/api/error";
import { serverApiClient } from "@/shared/api/server-client";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { EsportsPersonPageClient } from "@/views/esports-person";

const getCachedProfile = cache((personId: string) => getPersonProfile(personId, serverApiClient));

interface PageProps {
  params: Promise<{ locale: string; personId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, personId: rawPersonId } = await params;
  const personId = decodeURIComponent(rawPersonId);
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.esportsPerson" });
  const name = await getCachedProfile(personId)
    .then((profile) => profile.nickName)
    .catch(() => personId);
  return {
    title: t("title", { name }),
    description: t("description", { name }),
    alternates: localeAlternates(locale, esportsPersonHref(personId)),
  };
}

export default async function EsportsPersonPage({ params }: PageProps) {
  const { locale, personId: rawPersonId } = await params;
  setRequestLocale(toLocale(locale));
  const personId = decodeURIComponent(rawPersonId);

  const profile = await getCachedProfile(personId).catch((error: unknown) => {
    if (getApiErrorStatus(error) === 404) notFound();
    throw error;
  });

  const emptyCareer: PersonCareer = { personId, tenures: [], contracts: [], events: [] };
  const teamId = profile.status?.teamId ?? null;
  const [career, teams, leagues, roster] = await Promise.all([
    getPersonCareer(personId, serverApiClient).catch(() => emptyCareer),
    // 이름·로고 매핑용. 해체 팀도 커리어에 나오므로 함께 받는다.
    getEsportsTeams({ includeDisbanded: true }, serverApiClient).catch(() => []),
    getEsportsLeagues(serverApiClient).catch(() => []),
    teamId ? getTeamRoster(teamId, serverApiClient).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <EsportsPersonPageClient
      profile={profile}
      career={career}
      teams={teams}
      leagues={leagues}
      roster={roster}
    />
  );
}
