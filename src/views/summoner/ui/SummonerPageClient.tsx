"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { ProfileSection, ProfileTabs } from "@/widgets/summoner-profile";
import type { SummonerProfile } from "@/entities/summoner";
import type { LeagueInfoResponse } from "@/entities/league";
import { useCallback, useState } from "react";

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
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshComplete = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto sm:px-6 lg:px-8 py-8">
        <ProfileSection
          summonerName={gameName}
          region={region}
          initialData={profileData}
          onRefreshComplete={handleRefreshComplete}
        />
        <ProfileTabs
          summonerName={gameName}
          puuid={profileData.puuid}
          region={region}
          initialLeagueData={leagueData || undefined}
          refreshKey={refreshKey}
        />
      </main>
      <Footer />
    </div>
  );
}
