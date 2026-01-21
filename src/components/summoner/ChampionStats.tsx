"use client";

import { useChampionRanking } from "@/hooks/useSummoner";
import { useGameDataStore } from "@/stores/useGameDataStore";
import {
  getChampionImageUrl,
  getChampionNameByEnglishName,
} from "@/utils/champion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface ChampionStatsProps {
  puuid?: string | null;
  season?: string;
  showTitle?: boolean;
  limit?: number;
}

type SortField =
  | "playCount"
  | "winRate"
  | "wins"
  | "losses"
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
    // 소수점 2자리에서 올림 처리
    const raw = (wins / playCount) * 100;
    return Math.ceil(raw * 100) / 100;
  };

  // KDA 계산
  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return "perfect";
    return ((kills + assists) / deaths).toFixed(2);
  };

  // 정렬된 통계 계산 (항상 호출)
  const sortedStats = useMemo(() => {
    if (displayedStats.length === 0) return [];

    const statsWithCalculated = displayedStats.map((champion) => {
      const winRateRaw =
        typeof champion.winRate === "number"
          ? champion.winRate
          : calculateWinRate(champion.win, champion.playCount);
      const winRate = Math.ceil(winRateRaw * 100) / 100;

      // 이미 평균값이므로 그대로 사용
      const kda =
        typeof champion.kda === "number"
          ? champion.kda
          : (() => {
              const kdaValue = calculateKDA(
                champion.kills,
                champion.deaths,
                champion.assists
              );
              return kdaValue === "perfect" ? 999 : parseFloat(kdaValue);
            })();

      const losses =
        typeof champion.losses === "number"
          ? champion.losses
          : champion.playCount - champion.win;

      // 문서 필드(laneMinionsFirst10Minutes)를 기존 UI의 cs에 매핑 (없으면 null)
      const cs =
        typeof champion.cs === "number"
          ? champion.cs
          : typeof champion.laneMinionsFirst10Minutes === "number"
          ? champion.laneMinionsFirst10Minutes
          : null;

      const duration = champion.duration ?? null;

      return {
        ...champion,
        winRate,
        losses,
        kda,
        cs,
        duration,
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
        case "wins":
          aValue = a.win;
          bValue = b.win;
          break;
        case "losses":
          aValue = a.losses;
          bValue = b.losses;
          break;
        case "kda":
          aValue = a.kda;
          bValue = b.kda;
          break;
        case "kills":
          aValue = a.kills;
          bValue = b.kills;
          break;
        case "deaths":
          aValue = a.deaths;
          bValue = b.deaths;
          break;
        case "assists":
          aValue = a.assists;
          bValue = b.assists;
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

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-on-surface mb-4">챔피언 통계</h2>
        )}
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!puuid) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-on-surface mb-4">챔피언 통계</h2>
        )}
        <div className="text-center py-12 text-on-surface">
          소환사 정보가 필요합니다.
        </div>
      </div>
    );
  }

  if (sortedStats.length === 0 && !isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-on-surface mb-4">챔피언 통계</h2>
        )}
        <div className="text-center text-on-surface border border-divider rounded-lg py-12">
          챔피언 통계 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-bold text-on-surface mb-4">챔피언 통계</h2>
      )}
      <div className="bg-surface-4 rounded-lg border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-1/50 border-b border-divider">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface">
                  챔피언
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
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
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
                  onClick={() => handleSort("wins")}
                >
                  승리
                  {sortField === "wins" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
                  onClick={() => handleSort("losses")}
                >
                  패배
                  {sortField === "losses" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
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
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
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
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
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
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
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
                  className="px-4 py-3 text-right text-xs font-semibold text-on-surface cursor-pointer hover:text-on-surface-medium transition-colors"
                  onClick={() => handleSort("assists")}
                >
                  A
                  {sortField === "assists" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface">
                  CS
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
                    className="border-b border-divider/50 hover:bg-surface-8/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-surface-6 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                          <Image
                            src={getChampionImageUrl(champion.championName)}
                            alt={champion.championName}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="text-on-surface font-medium text-sm">
                          {getChampionNameByEnglishName(champion.championName)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.playCount}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.win}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.losses}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-on-surface font-semibold">
                        {champion.winRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-on-surface">
                        {kdaDisplay}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.kills.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.deaths.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.assists.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface text-sm">
                      {champion.cs !== null ? champion.cs.toFixed(1) : "-"}
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
