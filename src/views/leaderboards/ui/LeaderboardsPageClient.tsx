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
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="max-w-[1024px]">
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
