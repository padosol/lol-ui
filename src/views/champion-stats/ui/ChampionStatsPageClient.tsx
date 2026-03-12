"use client";

import {
  ChampionListSidebar,
  PositionTabsList,
  ChampionStatsTable,
} from "@/widgets/champion-stats-panel";
import { Header, Navigation, Footer } from "@/widgets/layout";
import { useChampionPositionStats, type ApiPositionType } from "@/entities/champion";
import { useSeasonStore } from "@/entities/season";
import { ChampionStatsFilters } from "@/features/champion-stats-filter";
import { useMemo, useState } from "react";

export default function ChampionStatsPageClient() {
  const [selectedTier, setSelectedTier] = useState("CHALLENGER");
  const [selectedPatch, setSelectedPatch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("kr");
  const [selectedPosition, setSelectedPosition] = useState<ApiPositionType>("TOP");

  const latestSeason = useSeasonStore((s) => s.getLatestSeason());
  const latestPatches = latestSeason?.patchVersions ?? [];
  const activePatch = selectedPatch || latestPatches[0] || "";

  const { data, isLoading, isError } = useChampionPositionStats(
    selectedPlatform,
    activePatch,
    selectedTier
  );

  const currentPositionChampions = useMemo(() => {
    if (!data) return [];
    const posData = data.find((d) => d.teamPosition === selectedPosition);
    return posData?.champions ?? [];
  }, [data, selectedPosition]);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-[1080px] mx-auto py-8">
        <div className="max-w-[1024px] mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            {/* 좌측 사이드바 - 데스크톱만 표시 */}
            <div className="hidden lg:block">
              <div>
                <ChampionListSidebar
                  tier={selectedTier}
                  patch={activePatch}
                  platformId={selectedPlatform}
                />
              </div>
            </div>

            {/* 우측 콘텐츠 */}
            <div className="space-y-6">
              <ChampionStatsFilters
                selectedTier={selectedTier}
                onTierChange={setSelectedTier}
                selectedPatch={selectedPatch}
                onPatchChange={setSelectedPatch}
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
              />

              <PositionTabsList
                selectedPosition={selectedPosition}
                onSelectPosition={setSelectedPosition}
                data={data ?? []}
              />

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-center py-20 text-loss">
                  통계 데이터를 불러오는 중 오류가 발생했습니다.
                </div>
              ) : (
                <ChampionStatsTable
                  champions={currentPositionChampions}
                  tier={selectedTier}
                  patch={activePatch}
                  platformId={selectedPlatform}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
