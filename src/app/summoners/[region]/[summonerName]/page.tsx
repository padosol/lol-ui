import { getLeagueByPuuid } from "@/lib/api/league";
import { serverApiClient } from "@/lib/api/server-client";
import { getSummonerProfile } from "@/lib/api/summoner";
import { logger } from "@/lib/logger";
import { getProfileIconImageUrl } from "@/utils/profile";
import { normalizeRegion, parseSummonerName } from "@/utils/summoner";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SummonerPageClient from "./SummonerPageClient";

interface PageProps {
  params: Promise<{
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
  const { region: urlRegion, summonerName: urlSummonerName } = await params;
  const { region, gameName } = parseParams(urlRegion, urlSummonerName);

  try {
    const profile = await getSummonerProfile(gameName, region, serverApiClient);
    const displayName = `${profile.gameName}#${profile.tagLine}`;
    const title = `${displayName} 전적 검색 | METAPICK`;

    let tierInfo = "";
    if (profile.tier) {
      tierInfo = profile.point != null
        ? `${profile.tier} ${profile.point}LP`
        : profile.rank
          ? `${profile.tier} ${profile.rank}`
          : profile.tier;
    }

    const description = tierInfo
      ? `${displayName}님의 리그 오브 레전드 전적 - ${tierInfo} | 승률, 챔피언 통계, 매치 히스토리`
      : `${displayName}님의 리그 오브 레전드 전적 | 승률, 챔피언 통계, 매치 히스토리`;

    const profileImage = getProfileIconImageUrl(profile.profileIconId);
    const url = `https://metapick.fun/summoners/${region}/${gameName}`;

    return {
      title,
      description,
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
      title: "소환사 전적 검색 | METAPICK",
      description: "리그 오브 레전드 소환사 전적 검색 - 승률, 챔피언 통계, 매치 히스토리 | METAPICK",
    };
  }
}

export default async function SummonerPage({ params }: PageProps) {
  const { region: urlRegion, summonerName: urlSummonerName } = await params;
  const { region, gameName } = parseParams(urlRegion, urlSummonerName);

  // 서버에서 직접 API 호출
  let profileData;
  try {
    profileData = await getSummonerProfile(gameName, region, serverApiClient);
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
