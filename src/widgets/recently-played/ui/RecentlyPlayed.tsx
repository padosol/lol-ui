"use client";

import { useSummonerMatches } from "@/entities/match";
import { useSeasonStore } from "@/entities/season";
import { getWinRateTextClass } from "@/entities/champion";
import { getProfileIconImageUrl } from "@/shared/lib/profile";
import { getKDAColorClass } from "@/shared/lib/game";
import { getSummonerHref } from "@/widgets/match-detail/ui/SummonerNameLink";
import type { ParticipantData } from "@/entities/match";
import { aggregateTeammates } from "../lib/aggregateTeammates";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface RecentlyPlayedProps {
  puuid?: string | null;
  region?: string;
}

export default function RecentlyPlayed({
  puuid,
  region = "kr",
}: RecentlyPlayedProps) {
  const latestSeasonValue = useSeasonStore((s) => s.getLatestSeasonValue());
  const effectiveSeason = latestSeasonValue ?? "";

  const { data: matchesData, isLoading } = useSummonerMatches(
    puuid || "",
    undefined,
    0,
    region,
    effectiveSeason,
  );

  const teammates = useMemo(() => {
    if (!matchesData?.content || !puuid) return [];
    return aggregateTeammates(matchesData.content, puuid);
  }, [matchesData?.content, puuid]);

  const renderHeader = () => (
    <div className="bg-surface-6/50 p-2">
      <span className="px-3 py-1.5 text-sm font-semibold text-on-surface">
        함께 플레이한 소환사
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="border border-divider rounded-lg overflow-hidden">
        {renderHeader()}
        <div className="p-3">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!puuid) {
    return (
      <div className="border border-divider rounded-lg overflow-hidden">
        {renderHeader()}
        <div className="p-3">
          <div className="text-center py-12 text-on-surface-medium">
            소환사 정보가 필요합니다.
          </div>
        </div>
      </div>
    );
  }

  if (teammates.length === 0) {
    return (
      <div className="border border-divider rounded-lg overflow-hidden">
        {renderHeader()}
        <div className="p-3">
          <div className="text-center text-on-surface-medium border border-divider rounded-lg py-4">
            함께 플레이한 소환사가 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-divider rounded-lg overflow-hidden">
      {renderHeader()}
      <div className="p-3 space-y-2">
        {teammates.map((teammate) => {
          const partial: Pick<
            ParticipantData,
            "riotIdGameName" | "riotIdTagline" | "summonerName"
          > = {
            riotIdGameName: teammate.riotIdGameName,
            riotIdTagline: teammate.riotIdTagline,
            summonerName: teammate.summonerName,
          };
          const href = getSummonerHref(
            partial as ParticipantData,
            region,
          );
          const kdaDisplay =
            teammate.kda === "perfect"
              ? "Perfect"
              : teammate.kda.toFixed(2);
          const winRate =
            teammate.gamesPlayed > 0
              ? Math.ceil((teammate.wins / teammate.gamesPlayed) * 10000) / 100
              : 0;

          return (
            <div
              key={teammate.puuid}
              className="flex items-center gap-1.5 p-1.5 bg-surface-8/50 rounded-lg hover:bg-surface-8 transition-colors border border-divider"
            >
              {/* 프로필 아이콘 */}
              <div className="w-8 h-8 bg-surface-6 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                <Image
                  src={getProfileIconImageUrl(teammate.profileIcon)}
                  alt={teammate.riotIdGameName}
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                {/* 1줄: 소환사명 + 승률 */}
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                    onClick={(e) => e.stopPropagation()}
                    className="text-on-surface font-semibold text-xs leading-tight truncate hover:underline"
                  >
                    {teammate.riotIdGameName}
                    {teammate.riotIdTagline && (
                      <span className="text-on-surface-medium ml-0.5">
                        #{teammate.riotIdTagline}
                      </span>
                    )}
                  </Link>
                  <div className={`shrink-0 text-xs font-semibold leading-tight ${getWinRateTextClass(winRate)}`}>
                    {winRate.toFixed(0)}%
                  </div>
                </div>

                {/* 2줄: KDA (평점) + 승 / 패 */}
                <div className="flex items-center justify-between gap-3 mt-1.5 leading-tight">
                  <div className="text-[11px]">
                    <span className="text-on-surface">
                      {(teammate.kills / teammate.gamesPlayed).toFixed(1)}/{(teammate.deaths / teammate.gamesPlayed).toFixed(1)}/{(teammate.assists / teammate.gamesPlayed).toFixed(1)}
                    </span>
                    <span className="text-on-surface-disabled mx-0.5">(</span>
                    <span className={getKDAColorClass(teammate.kda === "perfect" ? Infinity : teammate.kda)}>
                      {kdaDisplay}
                    </span>
                    <span className="text-on-surface-disabled">)</span>
                  </div>
                  <div className="shrink-0 text-[11px] leading-tight">
                    <span className="text-win">{teammate.wins}승</span>
                    <span className="text-on-surface-disabled mx-0.5">/</span>
                    <span className="text-loss">{teammate.losses}패</span>
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
