"use client";

import { GameTooltip } from "@/shared/ui/tooltip";
import { RUNE_TREE_NAMES } from "@/shared/constants/runes";
import type { RuneBuildData } from "@/entities/champion";
import { getPerkImageUrl } from "@/shared/lib/game";
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
  const primaryPerkIds = [
    build.primaryPerk0,
    build.primaryPerk1,
    build.primaryPerk2,
    build.primaryPerk3,
  ];
  const subPerkIds = [build.subPerk0, build.subPerk1];
  const statPerks = [
    build.statPerkOffense,
    build.statPerkFlex,
    build.statPerkDefense,
  ].filter(Boolean);

  const primaryTreeName =
    RUNE_TREE_NAMES[build.primaryStyleId] ||
    `트리 ${build.primaryStyleId}`;
  const secondaryTreeName =
    RUNE_TREE_NAMES[build.subStyleId] || `트리 ${build.subStyleId}`;

  const winRatePercent = build.winRate * 100;

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

      {/* 스탯 룬 */}
      {statPerks.length > 0 && (
        <>
          <div className="w-px h-8 bg-divider" />
          <div className="flex items-center gap-1">
            {statPerks.map((perkId, i) => (
              <GameTooltip key={i} type="rune" id={perkId}>
                <Image
                  src={getPerkImageUrl(perkId)}
                  alt={`stat-${perkId}`}
                  width={20}
                  height={20}
                  className="rounded-full"
                  unoptimized
                />
              </GameTooltip>
            ))}
          </div>
        </>
      )}

      {/* 승률/픽률/게임수 */}
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
            {(build.pickRate * 100).toFixed(1)}%
          </span>
        </span>
        <span className="text-on-surface-medium">
          {build.games.toLocaleString()}게임
        </span>
      </div>
    </div>
  );
}
