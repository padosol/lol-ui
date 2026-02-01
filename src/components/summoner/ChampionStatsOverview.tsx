"use client";

import { useChampionRanking } from "@/hooks/useSummoner";
import { useGameDataStore } from "@/stores/useGameDataStore";
import { getChampionImageUrl } from "@/utils/champion";
import { getChampionNameByEnglishName } from "@/utils/champion";
import { calcWinRateCeil2, getWinRateTextClass } from "@/utils/championStats";
import { getKDAColorClass } from "@/utils/game";
import Image from "next/image";
import { useEffect, useState } from "react";

type QueueTabType = "solo" | "flex";

interface ChampionStatsOverviewProps {
  puuid?: string | null;
  season?: string;
  showTitle?: boolean;
  limit?: number;
}

const queueTabs: { id: QueueTabType; label: string }[] = [
  { id: "solo", label: "솔로랭크" },
  { id: "flex", label: "자유 랭크" },
];

export default function ChampionStatsOverview({
  puuid,
  season = "26",
  showTitle = true,
  limit = 5,
}: ChampionStatsOverviewProps) {
  const [activeQueue, setActiveQueue] = useState<QueueTabType>("solo");
  const queueId = activeQueue === "solo" ? 420 : 440;

  const { data: championStats = [], isLoading } = useChampionRanking(
    puuid || "",
    season,
    queueId
  );

  // champion.json 데이터 로드 (zustand store 사용)
  const loadChampionData = useGameDataStore((state) => state.loadChampionData);
  useEffect(() => {
    loadChampionData();
  }, [loadChampionData]);

  // limit이 있으면 제한
  const displayedStats = limit ? championStats.slice(0, limit) : championStats;

  // 탭 헤더 렌더링
  const renderTabHeader = () => (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-on-surface">모스트 5</h2>
      </div>
      <div className="flex gap-1 bg-surface-6/50 p-1 rounded-lg">
        {queueTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveQueue(tab.id)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
              activeQueue === tab.id
                ? "bg-surface-1 text-on-surface font-semibold"
                : "text-on-surface-medium hover:text-on-surface"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="border border-divider rounded-lg p-4">
        {showTitle && renderTabHeader()}
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!puuid) {
    return (
      <div className="border border-divider rounded-lg p-4">
        {showTitle && renderTabHeader()}
        <div className="text-center py-12 text-on-surface-medium">
          소환사 정보가 필요합니다.
        </div>
      </div>
    );
  }

  if (displayedStats.length === 0 && !isLoading) {
    return (
      <div className="border border-divider rounded-lg p-4">
        {showTitle && renderTabHeader()}
        <div className="text-center text-on-surface-medium border border-divider rounded-lg py-4">
          {activeQueue === "solo" ? "솔로랭크" : "자유 랭크"} 챔피언 통계 데이터가 없습니다.
        </div>
      </div>
    );
  }

  // KDA 계산
  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return "perfect";
    return ((kills + assists) / deaths).toFixed(2);
  };

  return (
    <div className="border border-divider rounded-lg p-4">
      {showTitle && renderTabHeader()}
      <div className="space-y-2">
        {displayedStats.map((champion, index) => {
          const winRate = calcWinRateCeil2(champion.win, champion.playCount);
          const kdaValue = calculateKDA(
            champion.kills,
            champion.deaths,
            champion.assists
          );
          const kda = kdaValue === "perfect" ? "perfect" : parseFloat(kdaValue);
          const championNameKo = getChampionNameByEnglishName(
            champion.championName
          );

          return (
            <div
              key={champion.championId || index}
              className="flex items-center gap-2 p-2 bg-surface-8/50 rounded-lg hover:bg-surface-8 transition-colors"
            >
              {/* 챔피언 아이콘 */}
              <div className="w-10 h-10 bg-surface-6 rounded-lg flex items-center justify-center overflow-hidden relative">
                <Image
                  src={getChampionImageUrl(champion.championName)}
                  alt={champion.championName}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* 통계 정보 */}
              <div className="flex-1 min-w-0">
                {/* 1줄: 좌(챔피언명) / 우(승률) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-on-surface font-semibold text-xs leading-tight truncate">
                    {championNameKo}
                  </div>
                  <div
                    className={`shrink-0 text-xs font-semibold leading-tight ${getWinRateTextClass(
                      winRate
                    )}`}
                  >
                    {winRate.toFixed(2)}%
                  </div>
                </div>

                {/* 2줄: 좌(KDA) / 우(게임 수) */}
                <div className="flex items-center justify-between gap-3 mt-1.5 leading-tight">
                  <div className="text-on-surface-disabled text-[11px]">
                    KDA{" "}
                    <span className={getKDAColorClass(kda)}>
                      {kda === "perfect" ? "perfect" : kda.toFixed(2)}
                    </span>
                  </div>
                  <div className="shrink-0 text-on-surface-medium text-xs">
                    {champion.playCount}게임
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
