"use client";

import type {
  ApiPositionType,
  PositionChampionStats,
} from "@/entities/champion";
import { getPositionImageUrl, getPositionName } from "@/shared/lib/position";
import Image from "next/image";

const ALL_POSITIONS: ApiPositionType[] = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

interface PositionTabsListProps {
  selectedPosition: ApiPositionType;
  onSelectPosition: (position: ApiPositionType) => void;
  data: PositionChampionStats[];
}

export default function PositionTabsList({
  selectedPosition,
  onSelectPosition,
  data,
}: PositionTabsListProps) {
  return (
    <div className="flex border-b border-divider">
      {ALL_POSITIONS.map((pos) => {
        const isActive = pos === selectedPosition;
        const posData = data.find((d) => d.teamPosition === pos);
        const totalGames = posData
          ? posData.champions.reduce((sum, c) => sum + c.totalGames, 0)
          : 0;
        return (
          <button
            key={pos}
            type="button"
            onClick={() => onSelectPosition(pos)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
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
            {totalGames > 0 && (
              <span className="text-xs text-on-surface-medium">
                {totalGames.toLocaleString()}게임
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
