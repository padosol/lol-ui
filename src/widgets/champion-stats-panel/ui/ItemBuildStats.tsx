"use client";

import { GameTooltip } from "@/shared/ui/tooltip";
import type { ItemBuildData, StartItemBuildData } from "@/entities/champion";
import { getItemImageUrl } from "@/shared/lib/game";
import Image from "next/image";

interface ItemBuildStatsProps {
  data: ItemBuildData[];
  startItemBuilds?: StartItemBuildData[];
}

export default function ItemBuildStats({ data, startItemBuilds }: ItemBuildStatsProps) {
  if (data.length === 0 && (!startItemBuilds || startItemBuilds.length === 0)) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">아이템 빌드</h3>

      {startItemBuilds && startItemBuilds.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-on-surface-medium mb-2">시작 아이템</h4>
          <div className="space-y-2">
            {startItemBuilds.map((build, i) => {
              const itemIds = build.startItems
                .split(",")
                .map(Number)
                .filter(Boolean);
              return (
                <BuildRow
                  key={i}
                  itemIds={itemIds}
                  winRate={build.winRate}
                  games={build.games}
                  pickRate={build.pickRate}
                />
              );
            })}
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-on-surface-medium mb-2">코어 빌드</h4>
          <div className="space-y-2">
            {data.map((build, i) => {
              const itemIds = build.itemBuild
                .split(",")
                .map(Number)
                .filter(Boolean);
              return (
                <BuildRow
                  key={i}
                  itemIds={itemIds}
                  winRate={build.winRate}
                  games={build.games}
                  pickRate={build.pickRate}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BuildRow({
  itemIds,
  winRate,
  games,
  pickRate,
}: {
  itemIds: number[];
  winRate: number;
  games: number;
  pickRate: number;
}) {
  const winRatePercent = winRate * 100;
  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2">
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
              winRatePercent >= 50 ? "text-win" : "text-loss"
            }`}
          >
            {winRatePercent.toFixed(1)}%
          </span>
        </span>
        <span>
          <span className="text-on-surface-medium">픽률 </span>
          <span className="font-medium text-on-surface">
            {(pickRate * 100).toFixed(1)}%
          </span>
        </span>
        <span className="text-on-surface-medium">
          {games.toLocaleString()}게임
        </span>
      </div>
    </div>
  );
}
