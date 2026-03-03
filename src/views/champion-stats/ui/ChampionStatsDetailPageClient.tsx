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
  type PositionType,
} from "@/entities/champion";
import { useGameDataStore } from "@/shared/model/game-data";
import { useSeasonStore } from "@/entities/season";
import { POSITION_ORDER } from "@/shared/lib/position";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TIER_OPTIONS = [
  { value: "CHALLENGER", label: "챌린저" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "MASTER", label: "마스터" },
] as const;

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
  const [selectedPosition, setSelectedPosition] = useState<PositionType>("TOP");
  const [selectedTier, setSelectedTier] = useState(initialTier || "CHALLENGER");
  const [selectedPatch, setSelectedPatch] = useState(initialPatch || "");
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatformId || "kr");

  const [tierOpen, setTierOpen] = useState(false);
  const [patchOpen, setPatchOpen] = useState(false);
  const tierRef = useRef<HTMLDivElement>(null);
  const patchRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (tierRef.current && !tierRef.current.contains(e.target as Node)) {
      setTierOpen(false);
    }
    if (patchRef.current && !patchRef.current.contains(e.target as Node)) {
      setPatchOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const latestSeason = useSeasonStore((s) => s.getLatestSeason());
  const championData = useGameDataStore((s) => s.championData);
  const latestPatches = latestSeason?.patchVersions ?? [];
  const activePatch = selectedPatch || latestPatches[0] || "16.4";

  // 영문명 → numeric key 변환
  const championKey = useMemo(() => {
    if (!championData?.data) return "";
    const champ = championData.data[championId];
    return champ?.key || "";
  }, [championData, championId]);

  const championName = getChampionNameByEnglishName(championId);

  const { data, isLoading } = useChampionStats(
    championKey,
    activePatch,
    selectedTier,
    selectedPlatform
  );

  const availablePositions = useMemo(() => {
    if (!data?.stats) return [];
    return data.stats
      .map((s) => s.teamPosition as PositionType)
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            {championName} 통계
          </h1>
          <p className="text-on-surface-medium">
            승률, 아이템, 룬, 스킬, 상성 통계를 확인하세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 티어/패치 선택 드롭다운 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-medium">티어</span>
              <div ref={tierRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTierOpen((v) => !v)}
                  className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[130px] text-left"
                  aria-haspopup="listbox"
                  aria-expanded={tierOpen}
                >
                  {TIER_OPTIONS.find((o) => o.value === selectedTier)?.label}
                  <ChevronDown
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${tierOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {tierOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1" role="listbox" aria-label="티어 선택">
                      {TIER_OPTIONS.map((opt) => {
                        const selected = opt.value === selectedTier;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedTier(opt.value);
                              setTierOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                              selected
                                ? "bg-surface-8 text-on-surface font-medium"
                                : "text-on-surface hover:bg-surface-8"
                            }`}
                            role="option"
                            aria-selected={selected}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {latestPatches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-on-surface-medium">패치</span>
                <div ref={patchRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setPatchOpen((v) => !v)}
                    className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[80px] text-left"
                    aria-haspopup="listbox"
                    aria-expanded={patchOpen}
                  >
                    {activePatch}
                    <ChevronDown
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${patchOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {patchOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1" role="listbox" aria-label="패치 선택">
                        {latestPatches.map((patch) => {
                          const selected = patch === activePatch;
                          return (
                            <button
                              key={patch}
                              type="button"
                              onClick={() => {
                                setSelectedPatch(patch);
                                setPatchOpen(false);
                              }}
                              className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                                selected
                                  ? "bg-surface-8 text-on-surface font-medium"
                                  : "text-on-surface hover:bg-surface-8"
                              }`}
                              role="option"
                              aria-selected={selected}
                            >
                              {patch}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
          ) : data ? (
            <>
              {positionStats && (
                <ChampionOverview
                  data={positionStats}
                  tier={data.tier}
                  championId={championId}
                />
              )}
              <ItemBuildStats data={positionStats?.itemBuilds ?? []} />
              <RuneStats data={positionStats?.runeBuilds ?? []} />
              <SkillTreeStats
                data={positionStats?.skillBuilds ?? []}
                championName={championId}
              />
              <MatchupStats data={positionStats?.matchups ?? []} />
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
