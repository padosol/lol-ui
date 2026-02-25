"use client";

import type {
  ChampionPositionStats,
  PositionType,
} from "@/types/championStats";
import { getPositionImageUrl, getPositionName } from "@/utils/position";
import Image from "next/image";

interface PositionTabsProps {
  positions: PositionType[];
  selectedPosition: PositionType;
  onSelectPosition: (position: PositionType) => void;
  stats: ChampionPositionStats[];
}

export default function PositionTabs({
  positions,
  selectedPosition,
  onSelectPosition,
  stats,
}: PositionTabsProps) {
  return (
    <div className="flex border-b border-divider">
      {positions.map((pos) => {
        const isActive = pos === selectedPosition;
        const posStats = stats.find((s) => s.teamPosition === pos);
        return (
          <button
            key={pos}
            onClick={() => onSelectPosition(pos)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              isActive
                ? "text-on-surface border-primary"
                : "text-on-surface-medium hover:text-on-surface border-transparent"
            }`}
          >
            <Image
              src={getPositionImageUrl(pos)}
              alt={getPositionName(pos)}
              width={20}
              height={20}
              unoptimized
              className={isActive ? "opacity-100" : "opacity-60"}
            />
            <span className="hidden sm:inline">{getPositionName(pos)}</span>
            {posStats && (
              <>
                <span className="text-xs text-on-surface-medium">
                  {posStats.totalCount.toLocaleString()}게임
                </span>
                <span
                  className={`text-xs font-semibold ${
                    posStats.winRate >= 50 ? "text-win" : "text-loss"
                  }`}
                >
                  {posStats.winRate.toFixed(1)}%
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
