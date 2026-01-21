"use client";

import { use } from "react";
import axios from "axios";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import ProfileSection from "@/components/summoner/ProfileSection";
import ProfileTabs from "@/components/summoner/ProfileTabs";
import SummonerNotFound from "@/components/summoner/SummonerNotFound";
import { useSummonerProfile } from "@/hooks/useSummoner";
import { parseSummonerName, normalizeRegion } from "@/utils/summoner";

interface PageProps {
  params: Promise<{
    region: string;
    summonerName: string;
  }>;
}

export default function SummonerPage({ params }: PageProps) {
  // Next.js 15에서는 params가 Promise이므로 use()로 unwrap해야 함
  const { region: urlRegion, summonerName: urlSummonerName } = use(params);
  
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

  // 프로필 조회를 통해 소환사 존재 여부 확인
  const { data, isLoading, error } = useSummonerProfile(gameName, region);

  // 4xx 에러 처리 (존재하지 않는 유저)
  const isNotFound =
    error &&
    axios.isAxiosError(error) &&
    error.response?.status &&
    error.response.status >= 400 &&
    error.response.status < 500;

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-on-surface-medium">소환사 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 404 에러 - 소환사를 찾을 수 없음
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <Navigation />
        <SummonerNotFound summonerName={summonerName} tagline={tagline} />
        <Footer />
      </div>
    );
  }

  // 기타 에러
  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-error text-lg mb-4">
              오류가 발생했습니다: {error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-surface rounded-lg"
            >
              다시 시도
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 데이터가 없을 경우
  if (!data) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-on-surface-medium">데이터를 불러올 수 없습니다.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 정상적으로 데이터 표시
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileSection summonerName={gameName} region={region} />
        <ProfileTabs summonerName={gameName} puuid={data?.puuid} />
      </main>
      <Footer />
    </div>
  );
}

