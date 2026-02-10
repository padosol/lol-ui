"use client";

import { useRanking } from "@/hooks/useRanking";
import { getChampionImageUrl } from "@/utils/champion";
import { getTierImageUrl, getTierName } from "@/utils/tier";
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
        <span className="flex items-center text-win text-xs">
          <ChevronUp className="w-3 h-3" />
          {rankChange}
        </span>
      );
    } else if (rankChange < 0) {
      return (
        <span className="flex items-center text-lose text-xs">
          <ChevronDown className="w-3 h-3" />
          {Math.abs(rankChange)}
        </span>
      );
    }
    return <Minus className="w-3 h-3 text-on-surface-disabled" />;
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
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                순위
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                소환사
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                모스트 챔피언
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                승리
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                패배
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                승률
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                티어
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                LP
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
                <td className={`px-4 py-4 whitespace-nowrap ${player.currentRank === 1 ? "border-l-3 border-rank-top" : ""}`}>
                  <div className="flex items-center gap-2">
                    {player.currentRank === 1 && (
                      <Crown className="w-4 h-4 text-rank-top animate-crown-glow" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        player.currentRank <= 3
                          ? "text-rank-top"
                          : player.currentRank <= 10
                          ? "text-rank-high"
                          : "text-on-surface"
                      }`}
                    >
                      {player.currentRank !== 1 && player.currentRank}
                    </span>
                    {getRankChangeIcon(player.rankChange)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link
                    href={`/summoners/${region}/${player.gameName}-${player.tagLine}`}
                    className={
                      player.currentRank === 1
                        ? "text-sm font-bold text-rank-top hover:text-rank-top/80 transition-colors"
                        : "text-sm font-medium text-on-surface hover:text-on-surface-medium transition-colors"
                    }
                  >
                    {player.gameName}
                    <span className={player.currentRank === 1 ? "text-rank-top/60" : "text-on-surface-disabled"}>#{player.tagLine}</span>
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {player.champions.map((championName, idx) => (
                      <div
                        key={idx}
                        className="relative group"
                        title={championName}
                      >
                        <div className="relative w-8 h-8 rounded overflow-hidden border border-divider hover:border-primary transition-colors">
                          <Image
                            src={getChampionImageUrl(championName)}
                            alt={championName}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {idx === 0 && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface-4"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-on-surface">{player.wins}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-on-surface">{player.losses}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-on-surface">
                    {player.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-2 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {player.tier && (
                      <div className="relative w-8 h-8">
                        <Image
                          src={getTierImageUrl(player.tier)}
                          alt={player.tier}
                          fill
                          sizes="32px"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-on-surface">
                        {getTierName(player.tier)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap">
                  <span className={
                    player.currentRank === 1
                      ? "text-sm font-bold text-rank-top"
                      : "text-sm text-on-surface"
                  }>
                    {player.leaguePoints} LP
                  </span>
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
