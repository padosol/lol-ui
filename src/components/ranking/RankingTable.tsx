"use client";

import { getChampionImageUrl } from "@/utils/champion";
import { getTierImageUrl, getTierName } from "@/utils/tier";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface MostPlayedChampion {
  championName: string;
  games: number;
}

interface RankingPlayer {
  rank: number;
  summonerName: string;
  tagline: string;
  mostPlayedChampions: MostPlayedChampion[];
  tier: string;
  division: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  region: string;
}

interface RankingTableProps {
  region: string;
  queueType: string;
}

// 더미 데이터 생성 함수
function generateDummyData(region: string, _queueType: string): RankingPlayer[] {
  const tiers = [
    "CHALLENGER",
    "GRANDMASTER",
    "MASTER",
    "DIAMOND",
    "EMERALD",
    "PLATINUM",
    "GOLD",
    "SILVER",
    "BRONZE",
    "IRON",
  ];
  const ranks = ["I", "II", "III", "IV"];

  // 인기 챔피언 목록
  const popularChampions = [
    "Yasuo",
    "Zed",
    "LeeSin",
    "Thresh",
    "Jhin",
    "Vayne",
    "Lux",
    "Ahri",
    "Ezreal",
    "Jinx",
    "Garen",
    "Darius",
    "MasterYi",
    "Yone",
    "Sett",
    "Kaisa",
    "Akali",
    "Irelia",
    "Riven",
    "Fiora",
    "Katarina",
    "Talon",
    "Graves",
    "TwistedFate",
    "Orianna",
    "Syndra",
    "LeBlanc",
    "Zoe",
    "Caitlyn",
    "Ashe",
    "Varus",
    "Tristana",
    "Sivir",
    "MissFortune",
  ];

  const players: RankingPlayer[] = [];
  const names = [
    "Hide on Bush",
    "Faker",
    "ShowMaker",
    "Chovy",
    "Deft",
    "Ruler",
    "Gumayusi",
    "Keria",
    "Zeus",
    "Oner",
    "Canyon",
    "BeryL",
    "TheShy",
    "Rookie",
    "JackeyLove",
    "Uzi",
    "Doinb",
    "Tian",
    "Crisp",
    "Lwx",
  ];

  for (let i = 0; i < 100; i++) {
    const tierIndex = Math.floor(i / 10);
    const tier = tiers[Math.min(tierIndex, tiers.length - 1)];
    const division =
      tier === "CHALLENGER" || tier === "GRANDMASTER" || tier === "MASTER"
        ? ""
        : ranks[Math.floor(Math.random() * ranks.length)];

    const wins = Math.floor(Math.random() * 300) + 50;
    const losses = Math.floor(Math.random() * 200) + 30;
    const totalGames = wins + losses;
    const winRate = parseFloat(((wins / totalGames) * 100).toFixed(1));

    const lpRange: Record<string, [number, number]> = {
      CHALLENGER: [1200, 2000],
      GRANDMASTER: [1000, 1200],
      MASTER: [800, 1000],
      DIAMOND: [600, 800],
      EMERALD: [400, 600],
      PLATINUM: [200, 400],
      GOLD: [100, 200],
      SILVER: [50, 100],
      BRONZE: [0, 50],
      IRON: [0, 30],
    };

    const [minLP, maxLP] = lpRange[tier] || [0, 100];
    const leaguePoints =
      Math.floor(Math.random() * (maxLP - minLP + 1)) + minLP;

    const nameIndex = i % names.length;
    const tagline = region === "kr" ? "KR1" : region.toUpperCase();

    // 모스트 챔피언 3개 랜덤 선택
    const shuffledChampions = [...popularChampions].sort(
      () => Math.random() - 0.5
    );
    const mostPlayedChampions: MostPlayedChampion[] = shuffledChampions
      .slice(0, 3)
      .map((champion, idx) => ({
        championName: champion,
        games: Math.floor(Math.random() * 50) + 20 + (3 - idx) * 10, // 첫 번째 챔피언이 가장 많이 플레이
      }))
      .sort((a, b) => b.games - a.games); // 게임 수로 정렬

    players.push({
      rank: i + 1,
      summonerName: `${names[nameIndex]}${i > names.length ? i : ""}`,
      tagline,
      mostPlayedChampions,
      tier,
      division,
      leaguePoints,
      wins,
      losses,
      winRate,
      region,
    });
  }

  return players;
}

export default function RankingTable({ region, queueType }: RankingTableProps) {
  const [sortBy, setSortBy] = useState<"rank" | "lp" | "winRate">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const dummyData = useMemo(
    () => generateDummyData(region, queueType),
    [region, queueType]
  );

  const sortedData = useMemo(() => {
    const sorted = [...dummyData].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "rank") {
        comparison = a.rank - b.rank;
      } else if (sortBy === "lp") {
        comparison = b.leaguePoints - a.leaguePoints;
      } else if (sortBy === "winRate") {
        comparison = b.winRate - a.winRate;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [dummyData, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (column: "rank" | "lp" | "winRate") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: "rank" | "lp" | "winRate") => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-surface-4 rounded-lg overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-8">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider cursor-pointer hover:bg-surface-12 transition-colors"
                onClick={() => handleSort("rank")}
              >
                <div className="flex items-center gap-2">
                  순위 {getSortIcon("rank")}
                </div>
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
              <th
                className="px-4 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider cursor-pointer hover:bg-surface-12 transition-colors"
                onClick={() => handleSort("winRate")}
              >
                <div className="flex items-center gap-2">
                  승률 {getSortIcon("winRate")}
                </div>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider">
                티어
              </th>
              <th
                className="px-2 py-3 text-left text-xs font-medium text-on-surface uppercase tracking-wider cursor-pointer hover:bg-surface-12 transition-colors"
                onClick={() => handleSort("lp")}
              >
                <div className="flex items-center gap-2">
                  LP {getSortIcon("lp")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface-4 divide-y divide-divider">
            {paginatedData.map((player) => (
              <tr
                key={player.rank}
                className="hover:bg-surface-8 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`text-sm font-semibold ${
                        player.rank <= 3
                          ? "text-rank-top"
                          : player.rank <= 10
                          ? "text-rank-high"
                          : "text-on-surface"
                      }`}
                    >
                      {player.rank}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link
                    href={`/summoners/${region}/${player.summonerName}-${player.tagline}`}
                    className="text-sm font-medium text-on-surface hover:text-on-surface-medium transition-colors"
                  >
                    {player.summonerName}
                    <span className="text-on-surface-disabled">#{player.tagline}</span>
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {player.mostPlayedChampions.map((champion, idx) => (
                      <div
                        key={idx}
                        className="relative group"
                        title={`${champion.championName} (${champion.games}게임)`}
                      >
                        <div className="relative w-8 h-8 rounded overflow-hidden border border-divider hover:border-primary transition-colors">
                          <Image
                            src={getChampionImageUrl(champion.championName)}
                            alt={champion.championName}
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
                    {player.winRate}%
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
                      {player.division && (
                        <div className="text-xs text-on-surface-medium">
                          {player.division}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap">
                  <span className="text-sm text-on-surface">
                    {player.leaguePoints} LP
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-divider text-sm font-medium rounded-md text-on-surface bg-surface-4 hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-on-surface">
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                {" - "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData.length)}
                </span>
                {" / "}
                <span className="font-medium">{sortedData.length}</span>
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-divider bg-surface-4 text-sm font-medium text-on-surface hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
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
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-divider bg-surface-4 text-sm font-medium text-on-surface hover:bg-surface-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
