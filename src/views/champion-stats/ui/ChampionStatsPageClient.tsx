"use client";

import {
  ChampionListSidebar,
  PositionTabsList,
  ChampionGameCountTable,
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

  const { data, isLoading } = useChampionPositionStats(
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
      <main className="py-8 px-4">
        <div className="max-w-[1080px] mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-on-surface mb-2">
              챔피언 분석
            </h1>
            <p className="text-on-surface-medium">
              포지션별 챔피언 게임수를 확인하고, 챔피언을 클릭하여 상세 통계를 확인하세요
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
            {/* 좌측 사이드바 - 데스크톱만 표시 */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
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
              ) : (
                <ChampionGameCountTable
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
