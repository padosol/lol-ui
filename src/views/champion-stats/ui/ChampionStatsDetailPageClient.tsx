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
  type ApiPositionType,
  type ChampionStatsResponse,
} from "@/entities/champion";
import { useSeasonStore } from "@/entities/season";
import { ChampionStatsFilters } from "@/features/champion-stats-filter";
import { useMemo, useState } from "react";

interface ChampionStatsDetailPageClientProps {
  championId: string;
  championKey: string;
  initialTier?: string;
  initialPatch?: string;
  initialPlatformId?: string;
  initialActivePatch?: string;
  initialStatsData?: ChampionStatsResponse | null;
}

export default function ChampionStatsDetailPageClient({
  championId,
  championKey,
  initialTier,
  initialPatch,
  initialPlatformId,
  initialActivePatch,
  initialStatsData,
}: ChampionStatsDetailPageClientProps) {
  const [selectedPosition, setSelectedPosition] = useState<ApiPositionType | null>(null);
  const [selectedTier, setSelectedTier] = useState(initialTier || "CHALLENGER");
  const [selectedPatch, setSelectedPatch] = useState(initialPatch || "");
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatformId || "kr");

  const latestSeason = useSeasonStore((s) => s.getLatestSeason());
  const latestPatches = latestSeason?.patchVersions ?? [];
  const activePatch = selectedPatch || latestPatches[0] || initialActivePatch || "";

  const isInitialRequest = useMemo(() => {
    if (!initialStatsData || !initialActivePatch) return false;
    return (
      activePatch === initialActivePatch &&
      selectedTier === (initialTier || "CHALLENGER") &&
      selectedPlatform === (initialPlatformId || "kr")
    );
  }, [activePatch, selectedTier, selectedPlatform, initialActivePatch, initialTier, initialPlatformId, initialStatsData]);

  const { data, isLoading, isError } = useChampionStats(
    championKey,
    activePatch,
    selectedTier,
    selectedPlatform,
    isInitialRequest ? { initialData: initialStatsData! } : undefined
  );

  // 사용 가능한 포지션 목록 추출
  const availablePositions = useMemo(() => {
    if (!data?.positions) return [];
    return data.positions.map((p) => p.teamPosition);
  }, [data]);

  // 유효한 포지션 계산: 선택된 포지션이 없거나 목록에 없으면 첫 번째 포지션으로 fallback
  const effectivePosition = useMemo(() => {
    if (selectedPosition && availablePositions.includes(selectedPosition)) {
      return selectedPosition;
    }
    return availablePositions[0] ?? null;
  }, [availablePositions, selectedPosition]);

  // 현재 포지션의 통계 데이터
  const currentPositionStats = useMemo(() => {
    if (!data?.positions || data.positions.length === 0 || !effectivePosition) return null;
    return data.positions.find((p) => p.teamPosition === effectivePosition) ?? data.positions[0];
  }, [data, effectivePosition]);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-5xl mx-auto py-8">
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
            selectedPosition={effectivePosition ?? "TOP"}
            onSelectPosition={setSelectedPosition}
            availablePositions={availablePositions.length > 0 ? availablePositions : undefined}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-loss">
              통계 데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : currentPositionStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChampionOverview
                  data={currentPositionStats}
                  tier={data!.tier}
                  championId={championId}
                />
                <SkillTreeStats
                  data={currentPositionStats.skillBuilds.slice(0, 1)}
                  championName={championId}
                />
              </div>
              <ItemBuildStats data={currentPositionStats.itemBuilds} startItemBuilds={currentPositionStats.startItemBuilds} />
              <RuneStats data={currentPositionStats.runeBuilds} />
              <MatchupStats data={currentPositionStats.matchups ?? []} />
            </>
          ) : activePatch ? (
            <div className="text-center py-20 text-on-surface-medium">
              해당 패치의 통계 데이터가 없습니다.
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
