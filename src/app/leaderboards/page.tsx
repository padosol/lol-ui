"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RankingTable from "@/components/ranking/RankingTable";
import RankingFilters from "@/components/ranking/RankingFilters";

export default function LeaderboardsPage() {
  const [region, setRegion] = useState("kr");
  const [queueType, setQueueType] = useState("solo");

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">랭킹</h1>
          <p className="text-gray-400">
            리그 오브 레전드 랭킹을 확인하세요
          </p>
        </div>

        <RankingFilters
          region={region}
          queueType={queueType}
          onRegionChange={setRegion}
          onQueueTypeChange={setQueueType}
        />

        <RankingTable region={region} queueType={queueType} />
      </main>
      <Footer />
    </div>
  );
}

