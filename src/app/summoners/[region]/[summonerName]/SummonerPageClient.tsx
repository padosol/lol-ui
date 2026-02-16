"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import ProfileSection from "@/components/summoner/ProfileSection";
import ProfileTabs from "@/components/summoner/ProfileTabs";
import type { LeagueInfoResponse, SummonerProfile } from "@/types/api";

interface SummonerPageClientProps {
  profileData: SummonerProfile;
  leagueData: LeagueInfoResponse | null;
  gameName: string;
  region: string;
}

export default function SummonerPageClient({
  profileData,
  leagueData,
  gameName,
  region,
}: SummonerPageClientProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileSection
          summonerName={gameName}
          region={region}
          initialData={profileData}
        />
        <ProfileTabs
          summonerName={gameName}
          puuid={profileData.puuid}
          region={region}
          initialLeagueData={leagueData || undefined}
        />
      </main>
      <Footer />
    </div>
  );
}
