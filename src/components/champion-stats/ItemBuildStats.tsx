"use client";

import GameTooltip from "@/components/tooltip/GameTooltip";
import type { ItemBuildData } from "@/types/championStats";
import { getItemImageUrl } from "@/utils/game";
import Image from "next/image";

interface ItemBuildStatsProps {
  data: ItemBuildData[];
}

export default function ItemBuildStats({ data }: ItemBuildStatsProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">아이템 빌드</h3>
      <div className="space-y-2">
        {data.map((build, i) => {
          const itemIds = build.itemsSorted
            .split(",")
            .map(Number)
            .filter(Boolean);
          return (
            <div
              key={i}
              className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-1">
                {itemIds.map((itemId, j) => (
                  <GameTooltip key={j} type="item" id={itemId}>
                    <Image
                      src={getItemImageUrl(itemId)}
                      alt={`item-${itemId}`}
                      width={36}
                      height={36}
                      className="rounded border border-divider"
                      unoptimized
                    />
                  </GameTooltip>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-auto text-xs">
                <span>
                  <span className="text-on-surface-medium">승률 </span>
                  <span
                    className={`font-medium ${
                      build.totalWinRate >= 50 ? "text-win" : "text-loss"
                    }`}
                  >
                    {build.totalWinRate.toFixed(1)}%
                  </span>
                </span>
                <span className="text-on-surface-medium">
                  {build.totalGames.toLocaleString()}게임
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
