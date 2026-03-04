"use client";

import type { PositionChampionEntry } from "@/entities/champion";
import { getChampionImageUrl, getWinRateTextClass } from "@/entities/champion";
import { useGameDataStore } from "@/shared/model/game-data";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const TIER_COLORS: Record<string, string> = {
  OP: "bg-red-500 text-white",
  "1": "bg-orange-500 text-white",
  "2": "bg-yellow-500 text-surface",
  "3": "bg-green-500 text-white",
  "4": "bg-blue-500 text-white",
  "5": "bg-gray-500 text-white",
};

interface ChampionStatsTableProps {
  champions: PositionChampionEntry[];
  tier: string;
  patch: string;
  platformId: string;
}

export default function ChampionStatsTable({
  champions,
  tier,
  patch,
  platformId,
}: ChampionStatsTableProps) {
  const championData = useGameDataStore((s) => s.championData);

  const championMap = useMemo(() => {
    if (!championData?.data) return new Map<number, { name: string; id: string }>();
    const map = new Map<number, { name: string; id: string }>();
    for (const champ of Object.values(championData.data)) {
      map.set(Number(champ.key), { name: champ.name, id: champ.id });
    }
    return map;
  }, [championData]);

  const filtered = useMemo(() => {
    return [...champions].sort((a, b) => b.pickRate - a.pickRate);
  }, [champions]);

  return (
    <div className="bg-surface-2 border border-divider rounded-xl overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[48px_48px_1fr_80px_80px_80px] px-4 py-2 text-xs font-medium text-on-surface-medium border-b border-divider bg-surface-4">
        <span className="text-center">#</span>
        <span className="text-center">티어</span>
        <span>챔피언</span>
        <span className="text-right">승률</span>
        <span className="text-right">픽률</span>
        <span className="text-right">밴률</span>
      </div>

      {/* 테이블 바디 */}
      <div>
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-on-surface-medium text-sm">
            데이터가 없습니다.
          </div>
        ) : (
          filtered.map((entry, index) => {
            const info = championMap.get(entry.championId);
            const championName = info?.name ?? `Champion ${entry.championId}`;
            const championId = info?.id ?? "";
            const winRatePercent = entry.winRate * 100;

            const tierColor = TIER_COLORS[entry.tier] ?? "bg-gray-500 text-white";

            const content = (
              <>
                <span className="text-center text-sm text-on-surface-medium">
                  {index + 1}
                </span>
                <span className="flex justify-center">
                  <span className={`inline-flex items-center justify-center w-7 h-5 rounded text-xs font-bold ${tierColor}`}>
                    {entry.tier}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  {championId && (
                    <Image
                      src={getChampionImageUrl(championId)}
                      alt={championName}
                      width={32}
                      height={32}
                      unoptimized
                      className="rounded"
                    />
                  )}
                  <span className="text-sm font-medium text-on-surface">
                    {championName}
                  </span>
                </div>
                <span className={`text-right text-sm font-medium ${getWinRateTextClass(winRatePercent)}`}>
                  {winRatePercent.toFixed(1)}%
                </span>
                <span className="text-right text-sm text-on-surface">
                  {(entry.pickRate * 100).toFixed(1)}%
                </span>
                <span className="text-right text-sm text-on-surface">
                  {(entry.banRate * 100).toFixed(1)}%
                </span>
              </>
            );

            if (!championId) {
              return (
                <div
                  key={entry.championId}
                  className="grid grid-cols-[48px_48px_1fr_80px_80px_80px] items-center px-4 py-2.5 border-b border-divider last:border-b-0"
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={entry.championId}
                href={`/champion-stats/${championId}?tier=${tier}&patch=${patch}&platformId=${platformId}`}
                className="grid grid-cols-[48px_48px_1fr_80px_80px_80px] items-center px-4 py-2.5 hover:bg-surface-4 transition-colors border-b border-divider last:border-b-0"
              >
                {content}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
