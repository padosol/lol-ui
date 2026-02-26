"use client";

import GameTooltip from "@/components/tooltip/GameTooltip";
import { RUNE_TREE_NAMES } from "@/constants/runes";
import type { RuneBuildData } from "@/types/championStats";
import { getPerkImageUrl } from "@/utils/game";
import Image from "next/image";

interface RuneStatsProps {
  data: RuneBuildData[];
}

export default function RuneStats({ data }: RuneStatsProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">룬</h3>
      <div className="space-y-3">
        {data.map((build, i) => (
          <RunePageRow key={i} build={build} index={i} />
        ))}
      </div>
    </div>
  );
}

function RunePageRow({
  build,
  index,
}: {
  build: RuneBuildData;
  index: number;
}) {
  const primaryPerkIds = build.primaryPerkIds
    .split(",")
    .map(Number)
    .filter(Boolean);
  const subPerkIds = build.subPerkIds.split(",").map(Number).filter(Boolean);

  const primaryTreeName =
    RUNE_TREE_NAMES[build.primaryStyleId] ||
    `트리 ${build.primaryStyleId}`;
  const secondaryTreeName =
    RUNE_TREE_NAMES[build.subStyleId] || `트리 ${build.subStyleId}`;

  return (
    <div className="flex items-center gap-4 bg-surface rounded-lg px-4 py-3">
      <span className="text-xs text-on-surface-medium font-medium w-4 shrink-0">
        {index + 1}
      </span>

      {/* 주 트리 */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-on-surface-medium mr-1">
          {primaryTreeName}
        </span>
        {primaryPerkIds.map((runeId, i) => (
          <GameTooltip key={runeId} type="rune" id={runeId}>
            <Image
              src={getPerkImageUrl(runeId)}
              alt={`rune-${runeId}`}
              width={i === 0 ? 32 : 24}
              height={i === 0 ? 32 : 24}
              className="rounded-full"
              unoptimized
            />
          </GameTooltip>
        ))}
      </div>

      <div className="w-px h-8 bg-divider" />

      {/* 보조 트리 */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-on-surface-medium mr-1">
          {secondaryTreeName}
        </span>
        {subPerkIds.map((runeId) => (
          <GameTooltip key={runeId} type="rune" id={runeId}>
            <Image
              src={getPerkImageUrl(runeId)}
              alt={`rune-${runeId}`}
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
          </GameTooltip>
        ))}
      </div>

      {/* 승률/게임수 */}
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
}
