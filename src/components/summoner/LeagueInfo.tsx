"use client";

import { useLeagueInfo } from "@/hooks/useSummoner";
import { getTierImageUrl } from "@/utils/tier";
import Image from "next/image";

interface LeagueInfoProps {
  puuid?: string | null;
  showTitle?: boolean;
}

export default function LeagueInfo({
  puuid,
  showTitle = true,
}: LeagueInfoProps) {
  const { data: leagueInfo, isLoading } = useLeagueInfo(puuid || "");

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">리그 정보</h2>
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
          <h2 className="text-xl font-bold text-white mb-4">리그 정보</h2>
        )}
        <div className="text-center py-12 text-gray-400">
          소환사 정보가 필요합니다.
        </div>
      </div>
    );
  }

  // 리그 정보 배열 생성 (soloLeague와 flexLeague만 표시)
  const leagues = [leagueInfo?.soloLeague, leagueInfo?.flexLeague].filter(
    (league): league is NonNullable<typeof league> =>
      league !== null && league !== undefined
  );

  if (leagues.length === 0 && !isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">리그 정보</h2>
        )}
        <div className="text-center py-12 text-gray-400">
          리그 정보가 없습니다.
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      IRON: "from-gray-600 to-gray-800",
      BRONZE: "from-amber-700 to-amber-900",
      SILVER: "from-gray-400 to-gray-600",
      GOLD: "from-yellow-400 to-yellow-600",
      PLATINUM: "from-cyan-400 to-cyan-600",
      EMERALD: "from-emerald-400 to-emerald-600",
      DIAMOND: "from-blue-400 to-blue-600",
      MASTER: "from-purple-400 to-purple-600",
      GRANDMASTER: "from-red-400 to-red-600",
      CHALLENGER: "from-orange-400 to-orange-600",
    };
    return colors[tier] || "from-gray-400 to-gray-600";
  };

  const getTierInitial = (tier: string) => {
    const initials: Record<string, string> = {
      IRON: "I",
      BRONZE: "B",
      SILVER: "S",
      GOLD: "G",
      PLATINUM: "P",
      EMERALD: "E",
      DIAMOND: "D",
      MASTER: "M",
      GRANDMASTER: "GM",
      CHALLENGER: "C",
    };
    return initials[tier] || "?";
  };

  const getQueueTypeName = (leagueType: string) => {
    return leagueType === "RANKED_SOLO_5x5" ? "솔로랭크" : "자유 랭크";
  };

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-bold text-white mb-4">리그 정보</h2>
      )}
      <div className="space-y-4">
        {leagues.map((league, index) => (
          <div
            key={index}
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">
                {getQueueTypeName(league.leagueType)}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              {/* 티어 아이콘 */}
              <div className="relative w-16 h-16 shrink-0">
                <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 relative shadow-lg">
                  {getTierImageUrl(league.tier) ? (
                    <Image
                      src={getTierImageUrl(league.tier)}
                      alt={`${league.tier} 티어`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${getTierColor(
                        league.tier
                      )} flex items-center justify-center`}
                    >
                      <span className="text-white text-xl font-bold">
                        {getTierInitial(league.tier)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 랭크 정보 */}
              <div className="flex-1">
                <div className="text-white font-semibold text-lg mb-1">
                  {league.tier} {league.rank}
                </div>
                <div className="text-gray-400 text-sm mb-2">
                  {league.leaguePoints} LP
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">승률 </span>
                    <span className="text-white font-semibold">
                      {league.oow}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400 font-semibold">
                      {league.wins}승
                    </span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-red-400 font-semibold">
                      {league.losses}패
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
