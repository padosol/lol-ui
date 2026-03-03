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
      <main className="max-w-[1080px] mx-auto py-8 px-4">
        <div className="max-w-[1024px]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-on-surface mb-2">솔로 랭크</h2>
            <p className="text-on-surface-medium">리그 오브 레전드 랭킹을 확인하세요</p>
          </div>

          <div>
            <RankingFilters
              region={region}
              queueType={queueType}
              onRegionChange={setRegion}
              onQueueTypeChange={setQueueType}
            />
          </div>

          <div>
            <RankingTable key={`${region}-${queueType}`} region={region} queueType={queueType} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
