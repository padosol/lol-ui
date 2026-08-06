import { cache } from "react";
import { getLeagueByPuuid } from "@/entities/league";
import { serverApiClient } from "@/shared/api/server-client";
import { getSummonerProfile } from "@/entities/summoner";
import { logger } from "@/shared/lib/logger";
import { getProfileIconImageUrl } from "@/shared/lib/profile";
import { normalizeRegion, parseSummonerName } from "@/entities/summoner";
import { getTranslations } from "next-intl/server";
import { localeAlternates, SITE_URL } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SummonerPageClient } from "@/views/summoner";

const getCachedSummonerProfile = cache(
  (gameName: string, region: string) => getSummonerProfile(gameName, region, serverApiClient)
);

interface PageProps {
  params: Promise<{
    locale: string;
    region: string;
    summonerName: string;
  }>;
}

function parseParams(urlRegion: string, urlSummonerName: string) {
  const decodedSummonerName = decodeURIComponent(urlSummonerName);
  const normalizedRegion = normalizeRegion(urlRegion);
  const parsed = parseSummonerName(decodedSummonerName);
  const { name: summonerName, tagline } = parsed;
  const region = normalizedRegion || parsed.region;
  const gameName = tagline ? `${summonerName}-${tagline}` : summonerName;
  return { region, gameName };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const {
    locale,
    region: urlRegion,
    summonerName: urlSummonerName,
  } = await params;
  const { region, gameName } = parseParams(urlRegion, urlSummonerName);
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.summoner" });
  const alternates = localeAlternates(
    locale,
    `/summoners/${region}/${gameName}`
  );

  try {
    const profile = await getCachedSummonerProfile(gameName, region);
    const displayName = `${profile.gameName}#${profile.tagLine}`;
    const title = t("title", { name: displayName });

    let tierInfo = "";
    if (profile.tier) {
      tierInfo = profile.point != null
        ? `${profile.tier} ${profile.point}LP`
        : profile.rank
          ? `${profile.tier} ${profile.rank}`
          : profile.tier;
    }

    const description = tierInfo
      ? t("descriptionWithTier", { name: displayName, tier: tierInfo })
      : t("description", { name: displayName });

    const profileImage = getProfileIconImageUrl(profile.profileIconId);
    const url = `${SITE_URL}/${locale}/summoners/${region}/${gameName}`;

    return {
      title,
      description,
      alternates,
      openGraph: {
        title,
        description,
        ...(profileImage && { images: [{ url: profileImage }] }),
        url,
        type: "profile",
        siteName: "METAPICK",
      },
      twitter: {
        card: "summary",
        title,
        description,
        ...(profileImage && { images: [profileImage] }),
      },
    };
  } catch {
    return {
      title: t("fallbackTitle"),
      description: t("fallbackDescription"),
      alternates,
    };
  }
}

export default async function SummonerPage({ params }: PageProps) {
  const { region: urlRegion, summonerName: urlSummonerName } = await params;
  const { region, gameName } = parseParams(urlRegion, urlSummonerName);

  // 서버에서 직접 API 호출
  let profileData;
  try {
    profileData = await getCachedSummonerProfile(gameName, region);
  } catch (error) {
    logger.error("Failed to load summoner profile", {
      url: `/summoners/${region}/${gameName}`,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    notFound();
  }

  // 데이터가 없으면 notFound
  if (!profileData) {
    notFound();
  }

  // 리그 정보 가져오기 (실패해도 페이지는 표시)
  const leagueData = await getLeagueByPuuid(profileData.puuid, serverApiClient).catch(
    (error) => {
      logger.warn("Failed to load league data", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    },
  );

  return (
    <SummonerPageClient
      profileData={profileData}
      leagueData={leagueData}
      gameName={gameName}
      region={region}
    />
  );
}
