"use client";

import {
  ChampionOverview,
  ItemBuildStats,
  MatchupStats,
  PositionTabs,
  RuneStats,
  SkillTreeStats,
} from "@/widgets/champion-stats-panel";
import { Header, Navigation, Footer } from "@/widgets/layout";
import {
  useChampionStats,
  getChampionNameByEnglishName,
  type ApiPositionType,
} from "@/entities/champion";
import { useGameDataStore } from "@/shared/model/game-data";
import { useSeasonStore } from "@/entities/season";
import { POSITION_ORDER } from "@/shared/lib/position";
import { ChampionStatsFilters } from "@/features/champion-stats-filter";
import { useMemo, useState } from "react";

interface ChampionStatsDetailPageClientProps {
  championId: string;
  initialTier?: string;
  initialPatch?: string;
  initialPlatformId?: string;
}

export default function ChampionStatsDetailPageClient({
  championId,
  initialTier,
  initialPatch,
  initialPlatformId,
}: ChampionStatsDetailPageClientProps) {
  const [selectedPosition, setSelectedPosition] = useState<ApiPositionType>("TOP");
  const [selectedTier, setSelectedTier] = useState(initialTier || "CHALLENGER");
  const [selectedPatch, setSelectedPatch] = useState(initialPatch || "");
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatformId || "kr");

  const latestSeason = useSeasonStore((s) => s.getLatestSeason());
  const championData = useGameDataStore((s) => s.championData);
  const latestPatches = latestSeason?.patchVersions ?? [];
  const activePatch = selectedPatch || latestPatches[0] || "";

  // 영문명 → numeric key 변환
  const championKey = useMemo(() => {
    if (!championData?.data) return "";
    const champ = championData.data[championId];
    return champ?.key || "";
  }, [championData, championId]);

  const championName = getChampionNameByEnglishName(championId);
  const isInvalidChampion = !!championData?.data && !championKey;

  const { data, isLoading, isError } = useChampionStats(
    championKey,
    activePatch,
    selectedTier,
    selectedPlatform
  );

  const availablePositions = useMemo(() => {
    if (!data?.stats) return [];
    return data.stats
      .map((s) => s.teamPosition)
      .sort(
        (a, b) => (POSITION_ORDER[a] ?? 99) - (POSITION_ORDER[b] ?? 99)
      );
  }, [data]);

  const effectivePosition =
    availablePositions.length > 0 &&
    !availablePositions.includes(selectedPosition)
      ? availablePositions[0]
      : selectedPosition;

  const positionStats = useMemo(
    () => data?.stats.find((s) => s.teamPosition === effectivePosition),
    [data, effectivePosition]
  );

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isInvalidChampion ? (
          <div className="text-center py-20">
            <p className="text-lg text-on-surface-medium">
              챔피언을 찾을 수 없습니다: <span className="font-medium text-on-surface">{championId}</span>
            </p>
          </div>
        ) : (
        <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            {championName} 통계
          </h1>
          <p className="text-on-surface-medium">
            승률, 아이템, 룬, 스킬, 상성 통계를 확인하세요
          </p>
        </div>

        <div className="space-y-6">
          <ChampionStatsFilters
            selectedTier={selectedTier}
            onTierChange={setSelectedTier}
            selectedPatch={selectedPatch}
            onPatchChange={setSelectedPatch}
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
          />

          <PositionTabs
            positions={availablePositions}
            selectedPosition={effectivePosition}
            onSelectPosition={setSelectedPosition}
            stats={data?.stats ?? []}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-loss">
              통계 데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : data ? (
            <>
              {positionStats ? (
                <>
                  <ChampionOverview
                    data={positionStats}
                    tier={data.tier}
                    championId={championId}
                  />
                  <ItemBuildStats data={positionStats.itemBuilds} />
                  <RuneStats data={positionStats.runeBuilds} />
                  <SkillTreeStats
                    data={positionStats.skillBuilds}
                    championName={championId}
                  />
                  <MatchupStats data={positionStats.matchups} />
                </>
              ) : (
                <div className="text-center py-20 text-on-surface-medium">
                  선택한 포지션의 통계 데이터가 없습니다.
                </div>
              )}
            </>
          ) : activePatch ? (
            <div className="text-center py-20 text-on-surface-medium">
              해당 패치의 통계 데이터가 없습니다.
            </div>
          ) : null}
        </div>
        </>
        )}
      </main>
      <Footer />
    </div>
  );
}
