"use client";

import { useChampionRanking } from "@/hooks/useSummoner";
import { getChampionImageUrl, getChampionNameByEnglishName } from "@/utils/champion";
import { getKDAColorClass } from "@/utils/game";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useGameDataStore } from "@/stores/useGameDataStore";

interface ChampionStatsProps {
  puuid?: string | null;
  season?: string;
  showTitle?: boolean;
  limit?: number;
}

type SortField =
  | "playCount"
  | "winRate"
  | "kda"
  | "kills"
  | "deaths"
  | "assists";
type SortDirection = "asc" | "desc";

export default function ChampionStats({
  puuid,
  season = "25",
  showTitle = true,
  limit,
}: ChampionStatsProps) {
  const { data: championStats = [], isLoading } = useChampionRanking(
    puuid || "",
    season
  );

  const [sortField, setSortField] = useState<SortField>("playCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // champion.json 데이터 로드
  const loadChampionData = useGameDataStore((state) => state.loadChampionData);
  useEffect(() => {
    loadChampionData();
  }, [loadChampionData]);

  // limit이 있으면 제한
  const displayedStats = limit ? championStats.slice(0, limit) : championStats;

  // 승률 계산
  const calculateWinRate = (wins: number, playCount: number): number => {
    if (playCount === 0) return 0;
    return parseFloat(((wins / playCount) * 100).toFixed(1));
  };

  // KDA 계산
  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return "perfect";
    return ((kills + assists) / deaths).toFixed(2);
  };

  // 평균 계산
  const calculateAverage = (total: number, count: number): number => {
    if (count === 0) return 0;
    return parseFloat((total / count).toFixed(1));
  };

  // 정렬된 통계 계산 (항상 호출)
  const sortedStats = useMemo(() => {
    if (displayedStats.length === 0) return [];

    const statsWithCalculated = displayedStats.map((champion) => {
      const winRate = calculateWinRate(champion.win, champion.playCount);
      const kdaValue = calculateKDA(
        champion.kills,
        champion.deaths,
        champion.assists
      );
      const kda = kdaValue === "perfect" ? 999 : parseFloat(kdaValue);
      const avgKills = calculateAverage(champion.kills, champion.playCount);
      const avgDeaths = calculateAverage(champion.deaths, champion.playCount);
      const avgAssists = calculateAverage(champion.assists, champion.playCount);
      const avgCS = champion.cs
        ? calculateAverage(champion.cs, champion.playCount)
        : null;
      const avgDuration = champion.duration
        ? calculateAverage(champion.duration, champion.playCount)
        : null;

      return {
        ...champion,
        winRate,
        kda,
        avgKills,
        avgDeaths,
        avgAssists,
        avgCS,
        avgDuration,
      };
    });

    return [...statsWithCalculated].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "playCount":
          aValue = a.playCount;
          bValue = b.playCount;
          break;
        case "winRate":
          aValue = a.winRate;
          bValue = b.winRate;
          break;
        case "kda":
          aValue = a.kda;
          bValue = b.kda;
          break;
        case "kills":
          aValue = a.avgKills;
          bValue = b.avgKills;
          break;
        case "deaths":
          aValue = a.avgDeaths;
          bValue = b.avgDeaths;
          break;
        case "assists":
          aValue = a.avgAssists;
          bValue = b.avgAssists;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [displayedStats, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">챔피언 통계</h2>
        )}
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!puuid) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">챔피언 통계</h2>
        )}
        <div className="text-center py-12 text-white">
          소환사 정보가 필요합니다.
        </div>
      </div>
    );
  }

  if (sortedStats.length === 0 && !isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">챔피언 통계</h2>
        )}
        <div className="text-center text-white border border-gray-600 rounded-lg py-12">
          챔피언 통계 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-bold text-white mb-4">챔피언 통계</h2>
      )}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                  챔피언
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort("playCount")}
                >
                  게임
                  {sortField === "playCount" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort("winRate")}
                >
                  승률
                  {sortField === "winRate" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort("kda")}
                >
                  KDA
                  {sortField === "kda" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort("kills")}
                >
                  K
                  {sortField === "kills" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort("deaths")}
                >
                  D
                  {sortField === "deaths" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort("assists")}
                >
                  A
                  {sortField === "assists" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white">
                  CS
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white">
                  시간
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((champion, index) => {
                const kdaDisplay =
                  champion.kda === 999 ? "perfect" : champion.kda.toFixed(2);

                return (
                  <tr
                    key={champion.championId || index}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                          <Image
                            src={getChampionImageUrl(champion.championName)}
                            alt={champion.championName}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="text-white font-medium text-sm">
                          {getChampionNameByEnglishName(champion.championName)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm">
                      {champion.playCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-semibold">
                        {champion.winRate}%
                      </span>
                      <span className="text-white text-xs ml-1">
                        ({champion.win}승 {champion.playCount - champion.win}
                        패)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-white">
                        {kdaDisplay}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm">
                      {champion.avgKills}
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm">
                      {champion.avgDeaths}
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm">
                      {champion.avgAssists}
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm">
                      {champion.avgCS !== null ? champion.avgCS : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm">
                      {formatDuration(champion.avgDuration)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
