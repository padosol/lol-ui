"use client";

import { useChampionRanking } from "@/hooks/useSummoner";
import { getChampionImageUrl } from "@/utils/champion";
import { getKDAColorClass } from "@/utils/game";
import Image from "next/image";

interface ChampionStatsProps {
  puuid?: string | null;
  season?: string;
  showTitle?: boolean;
  limit?: number;
}

export default function ChampionStats({
  puuid,
  season = "2024",
  showTitle = true,
  limit,
}: ChampionStatsProps) {
  const { data: championStats = [], isLoading } = useChampionRanking(
    puuid || "",
    season
  );

  // limit이 있으면 제한
  const displayedStats = limit ? championStats.slice(0, limit) : championStats;

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
        <div className="text-center py-12 text-gray-400">
          소환사 정보가 필요합니다.
        </div>
      </div>
    );
  }

  if (displayedStats.length === 0 && !isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">챔피언 통계</h2>
        )}
        <div className="text-center text-gray-400 border border-gray-600 rounded-lg">
          챔피언 통계 데이터가 없습니다.
        </div>
      </div>
    );
  }

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

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-bold text-white mb-4">챔피언 통계</h2>
      )}
      <div className="space-y-3">
        {displayedStats.map((champion, index) => {
          const winRate = calculateWinRate(champion.win, champion.playCount);
          const kdaValue = calculateKDA(champion.kills, champion.deaths, champion.assists);
          const kda = kdaValue === "perfect" ? "perfect" : parseFloat(kdaValue);

          return (
            <div
              key={champion.championId || index}
              className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {/* 챔피언 아이콘 */}
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden relative">
                <Image
                  src={getChampionImageUrl(champion.championName)}
                  alt={champion.championName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* 통계 정보 */}
              <div className="flex-1">
                <div className="text-white font-semibold mb-1">
                  {champion.championName}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    {champion.playCount}게임
                  </span>
                  <span
                    className={
                      winRate >= 60
                        ? "text-green-400"
                        : winRate >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {winRate}% 승률
                  </span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {champion.win}승 {champion.playCount - champion.win}패 · KDA{" "}
                  <span className={getKDAColorClass(kda)}>{kda}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
