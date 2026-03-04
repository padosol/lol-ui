"use client";

import { useGameDataStore } from "@/shared/model/game-data";

interface ChampionPassiveTooltipContentProps {
  championName: string;
}

export default function ChampionPassiveTooltipContent({ championName }: ChampionPassiveTooltipContentProps) {
  const championData = useGameDataStore((state) => state.championData);

  const champion = championData?.data?.[championName];
  const passive = champion?.passive;

  if (!passive) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
        <div className="text-on-surface-medium text-xs">패시브 정보 없음</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
      <div className="text-on-surface font-bold text-xs">{passive.name}</div>
      {passive.description && (
        <div className="text-on-surface-medium text-[10px] mt-1 leading-relaxed">
          {passive.description}
        </div>
      )}
    </div>
  );
}
