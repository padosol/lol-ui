"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { RankingFilters } from "@/features/ranking-filter";
import { RankingTable } from "@/widgets/ranking";
import { useRegionStore } from "@/features/region-select";
import { useState } from "react";

export default function LeaderboardsPageClient() {
  const { region, setRegion } = useRegionStore();
  const [queueType, setQueueType] = useState("solo");

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-on-surface mb-2">솔로 랭크</h2>
          <p className="text-on-surface-medium">리그 오브 레전드 랭킹을 확인하세요</p>
        </div>

        <RankingFilters
          region={region}
          queueType={queueType}
          onRegionChange={setRegion}
          onQueueTypeChange={setQueueType}
        />

        <RankingTable key={`${region}-${queueType}`} region={region} queueType={queueType} />
      </main>
      <Footer />
    </div>
  );
}
