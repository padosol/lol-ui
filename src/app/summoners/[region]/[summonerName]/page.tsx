import { getLeagueByPuuid } from "@/lib/api/league";
import { getSummonerProfile } from "@/lib/api/summoner";
import { logger } from "@/lib/logger";
import { normalizeRegion, parseSummonerName } from "@/utils/summoner";
import { notFound } from "next/navigation";
import SummonerPageClient from "./SummonerPageClient";

interface PageProps {
  params: Promise<{
    region: string;
    summonerName: string;
  }>;
}

export default async function SummonerPage({ params }: PageProps) {
  const { region: urlRegion, summonerName: urlSummonerName } = await params;

  // URL 디코딩
  const decodedSummonerName = decodeURIComponent(urlSummonerName);
  const normalizedRegion = normalizeRegion(urlRegion);

  // 소환사 이름 파싱 (예: "hideonbush-kr1" -> { name: "hideonbush", tagline: "kr1", region: "kr" })
  const parsed = parseSummonerName(decodedSummonerName);
  const { name: summonerName, tagline } = parsed;

  // URL에서 받은 region을 우선 사용, 없으면 파싱된 region 사용
  const region = normalizedRegion || parsed.region;

  // API에서 요구하는 gameName 형식: "name-tagLine"
  const gameName = tagline ? `${summonerName}-${tagline}` : summonerName;

  // 서버에서 직접 API 호출
  let profileData;
  try {
    profileData = await getSummonerProfile(gameName, region);
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
  const leagueData = await getLeagueByPuuid(profileData.puuid).catch(
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
