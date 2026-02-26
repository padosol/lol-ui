"use client";

import ChampionListSidebar from "@/components/champion-stats/ChampionListSidebar";
import ChampionOverview from "@/components/champion-stats/ChampionOverview";
import ItemBuildStats from "@/components/champion-stats/ItemBuildStats";
import MatchupStats from "@/components/champion-stats/MatchupStats";
import PositionTabs from "@/components/champion-stats/PositionTabs";
import RuneStats from "@/components/champion-stats/RuneStats";
import SkillTreeStats from "@/components/champion-stats/SkillTreeStats";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import { useChampionStats } from "@/hooks/useChampionStats";
import { useGameDataStore } from "@/stores/useGameDataStore";
import { useRegionStore } from "@/stores/useRegionStore";
import { useSeasonStore } from "@/stores/useSeasonStore";
import type { PositionType } from "@/types/championStats";
import { POSITION_ORDER } from "@/utils/position";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TIER_OPTIONS = [
  { value: "MASTER", label: "마스터" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "CHALLENGER", label: "챌린저" },
] as const;

export default function ChampionStatsPageClient() {
  const [selectedChampionId, setSelectedChampionId] = useState("Aatrox");
  const [selectedPosition, setSelectedPosition] =
    useState<PositionType>("TOP");
  const [selectedTier, setSelectedTier] = useState("MASTER");
  const [selectedPatch, setSelectedPatch] = useState("");

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

  const seasons = useSeasonStore((s) => s.seasons);
  const region = useRegionStore((s) => s.region);
  const championData = useGameDataStore((s) => s.championData);

  // 최신 시즌만 추출
  const latestSeason = useMemo(() => {
    if (seasons.length === 0) return null;
    return seasons.reduce((latest, s) =>
      s.seasonValue > latest.seasonValue ? s : latest
    );
  }, [seasons]);

  const latestPatches = latestSeason?.patchVersions ?? [];

  // 기본 패치 선택: 최신 시즌의 첫 번째 패치
  const activePatch = selectedPatch || latestPatches[0] || "16.4";

  // 선택된 챔피언의 numeric key 변환 (영문명 → key)
  const championKey = useMemo(() => {
    if (!championData?.data) return "";
    const champ = championData.data[selectedChampionId];
    return champ?.key || "";
  }, [championData, selectedChampionId]);

  const { data, isLoading } = useChampionStats(
    championKey,
    activePatch,
    selectedTier,
    region
  );

  // API 응답에서 사용 가능한 포지션 추출 & 정렬
  const availablePositions = useMemo(() => {
    if (!data?.stats) return [];
    return data.stats
      .map((s) => s.teamPosition as PositionType)
      .sort(
        (a, b) => (POSITION_ORDER[a] ?? 99) - (POSITION_ORDER[b] ?? 99)
      );
  }, [data]);

  // 선택 포지션 자동 보정 (유효하지 않으면 첫 번째 포지션 사용)
  const effectivePosition =
    availablePositions.length > 0 &&
    !availablePositions.includes(selectedPosition)
      ? availablePositions[0]
      : selectedPosition;

  // 포지션별 통계
  const positionStats = useMemo(
    () => data?.stats.find((s) => s.teamPosition === effectivePosition),
    [data, effectivePosition]
  );

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            챔피언 통계
          </h1>
          <p className="text-on-surface-medium">
            챔피언별 승률, 아이템, 룬, 스킬, 상성 통계를 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-14">
              <ChampionListSidebar
                selectedChampionId={selectedChampionId}
                onSelectChampion={setSelectedChampionId}
              />
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-6">
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
                    championId={selectedChampionId}
                  />
                )}
                <ItemBuildStats data={positionStats?.itemBuilds ?? []} />
                <RuneStats data={positionStats?.runeBuilds ?? []} />
                <SkillTreeStats
                  data={positionStats?.skillBuilds ?? []}
                  championName={selectedChampionId}
                />
                <MatchupStats data={positionStats?.matchups ?? []} />
              </>
            ) : activePatch ? (
              <div className="text-center py-20 text-on-surface-medium">
                해당 패치의 통계 데이터가 없습니다.
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
