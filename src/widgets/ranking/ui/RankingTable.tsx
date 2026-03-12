"use client";

import { GameTooltip } from "@/shared/ui/tooltip";
import { useRanking } from "@/entities/ranking";
import { getChampionImageUrl } from "@/entities/champion";
import { getTierImageUrl, getTierName } from "@/shared/lib/tier";
import { ChevronDown, ChevronUp, Crown, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface RankingTableProps {
  region: string;
  queueType: string;
}

export default function RankingTable({ region, queueType }: RankingTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // queueType을 API의 rankType으로 변환
  const rankType = queueType === "solo" ? "SOLO" : "FLEX";

  const { data, isLoading, error } = useRanking(region, rankType, currentPage);

  // 순위 변동 아이콘 표시
  const getRankChangeIcon = (rankChange: number) => {
    if (rankChange > 0) {
      return (
        <span className="flex items-center text-win text-[10px] sm:text-xs">
          <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {rankChange}
        </span>
      );
    } else if (rankChange < 0) {
      return (
        <span className="flex items-center text-lose text-[10px] sm:text-xs">
          <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {Math.abs(rankChange)}
        </span>
      );
    }
    return <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-on-surface-disabled" />;
  };

  if (isLoading) {
    return (
      <div className="bg-surface-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-on-surface-medium">랭킹 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-4 rounded-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lose mb-2">랭킹을 불러오는 데 실패했습니다.</p>
          <p className="text-on-surface-disabled text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="bg-surface-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-20">
          <p className="text-on-surface-medium">랭킹 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-4 rounded-lg overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-8">
            <tr>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                순위
              </th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                소환사
              </th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                <span className="sm:hidden">승</span>
                <span className="hidden sm:inline">승리</span>
              </th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                <span className="sm:hidden">패</span>
                <span className="hidden sm:inline">패배</span>
              </th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                승률
              </th>
              <th className="px-1 sm:px-2 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                티어
              </th>
              <th className="px-1 sm:px-2 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                LP
              </th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-on-surface uppercase tracking-wider">
                <span className="sm:hidden">모스트</span>
                <span className="hidden sm:inline">모스트 챔피언</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface-4 divide-y divide-divider">
            {data.content.map((player) => (
              <tr
                key={player.puuid}
                className={
                  player.currentRank === 1
                    ? "rank-1-row transition-colors"
                    : "hover:bg-surface-8 transition-colors"
                }
              >
                <td className={`px-1 sm:px-4 py-1.5 sm:py-4 whitespace-nowrap ${player.currentRank === 1 ? "border-l-3 border-rank-top" : ""}`}>
                  <div className="flex items-center gap-2">
                    {player.currentRank === 1 && (
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-rank-top animate-crown-glow shrink-0" />
                    )}
                    <span
                      className={`flex-1 text-center text-[11px] sm:text-sm font-semibold ${
                        player.currentRank <= 3
                          ? "text-rank-top"
                          : player.currentRank <= 10
                          ? "text-rank-high"
                          : "text-on-surface"
                      }`}
                    >
                      {player.currentRank !== 1 && player.currentRank}
                    </span>
                    <span className="flex-1 flex justify-center">
                      {getRankChangeIcon(player.rankChange)}
                    </span>
                  </div>
                </td>
                <td className="px-1 sm:px-4 py-1.5 sm:py-4 whitespace-nowrap">
                  <Link
                    href={`/summoners/${region}/${player.gameName}-${player.tagLine}`}
                    prefetch={false}
                    className={`flex items-center max-w-[80px] sm:max-w-none ${
                      player.currentRank === 1
                        ? "text-[11px] sm:text-sm font-bold text-rank-top hover:text-rank-top/80 transition-colors"
                        : "text-[11px] sm:text-sm font-medium text-on-surface hover:text-on-surface-medium transition-colors"
                    }`}
                  >
                    <span className="truncate min-w-0">{player.gameName}</span>
                    <span className={`shrink-0 ${player.currentRank === 1 ? "text-rank-top/60" : "text-on-surface-disabled"}`}>#{player.tagLine}</span>
                  </Link>
                </td>
                <td className="px-1 sm:px-4 py-1.5 sm:py-4 whitespace-nowrap">
                  <span className="text-[11px] sm:text-sm text-on-surface">{player.wins}</span>
                </td>
                <td className="px-1 sm:px-4 py-1.5 sm:py-4 whitespace-nowrap">
                  <span className="text-[11px] sm:text-sm text-on-surface">{player.losses}</span>
                </td>
                <td className="px-1 sm:px-4 py-1.5 sm:py-4 whitespace-nowrap">
                  <span className="text-[11px] sm:text-sm font-medium text-on-surface">
                    {player.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-1 sm:px-2 py-1.5 sm:py-4 whitespace-nowrap align-bottom">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {player.tier && (
                      <div className="relative w-5 h-5 sm:w-8 sm:h-8">
                        <Image
                          src={getTierImageUrl(player.tier)}
                          alt={player.tier}
                          fill
                          sizes="(max-width: 640px) 20px, 32px"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-on-surface">
                        {getTierName(player.tier)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-1 sm:px-2 py-1.5 sm:py-4 whitespace-nowrap">
                  <span className={
                    player.currentRank === 1
                      ? "text-[10px] sm:text-sm font-bold text-rank-top"
                      : "text-[10px] sm:text-sm text-on-surface"
                  }>
                    {player.leaguePoints} LP
                  </span>
                </td>
                <td className="px-1 sm:px-4 py-1.5 sm:py-4">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {player.champions.map((championName, idx) => (
                      <GameTooltip key={idx} type="champion" id={championName}>
                        <div className="relative group">
                          <div className="relative w-4 h-4 sm:w-8 sm:h-8 rounded overflow-hidden border border-divider hover:border-primary transition-colors">
                            <Image
                              src={getChampionImageUrl(championName)}
                              alt={championName}
                              fill
                              sizes="(max-width: 640px) 16px, 32px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      </GameTooltip>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="bg-surface-8 px-4 py-3 flex items-center justify-between border-t border-divider">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-divider text-sm font-medium rounded-md text-on-surface bg-surface-4 hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={data.isLast}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-divider text-sm font-medium rounded-md text-on-surface bg-surface-4 hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-on-surface">
              페이지 <span className="font-medium">{currentPage}</span> / <span className="font-medium">{data.totalPages}</span>
              <span className="ml-2 text-on-surface-disabled">(총 {data.totalElements}명)</span>
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-divider bg-surface-4 text-sm font-medium text-on-surface hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: 5 }, (_, i) => {
                let pageNum;
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return pageNum;
              })
                .filter((pageNum) => pageNum >= 1 && pageNum <= data.totalPages)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? "z-10 bg-primary border-primary text-on-surface"
                        : "bg-surface-4 border-divider text-on-surface hover:bg-surface-6"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={data.isLast}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-divider bg-surface-4 text-sm font-medium text-on-surface hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
