"use client";

import { useState } from "react";
import { GameTooltip } from "@/shared/ui/tooltip";
import type { BootBuildData } from "@/entities/champion";
import { getItemImageUrl } from "@/shared/lib/game";
import Image from "next/image";
import StatSectionHeader from "./StatSectionHeader";

const DEFAULT_VISIBLE = 2;

interface BootBuildStatsProps {
  data: BootBuildData[];
}

export default function BootBuildStats({ data }: BootBuildStatsProps) {
  const [expanded, setExpanded] = useState(false);
  if (!data || data.length === 0) return null;

  const visible = expanded ? data : data.slice(0, DEFAULT_VISIBLE);

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-0 md:p-5">
      <StatSectionHeader
        title="신발 빌드"
        totalCount={data.length}
        visibleCount={Math.min(DEFAULT_VISIBLE, data.length)}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      <div className="space-y-2">
        {visible.map((build, i) => (
          <BuildRow
            key={i}
            bootId={build.bootId}
            winRate={build.winRate}
            games={build.games}
            pickRate={build.pickRate}
          />
        ))}
      </div>
    </div>
  );
}

function BuildRow({
  bootId,
  winRate,
  games,
  pickRate,
}: {
  bootId: number;
  winRate: number;
  games: number;
  pickRate: number;
}) {
  const winRatePercent = winRate * 100;
  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2">
      <GameTooltip type="item" id={bootId}>
        <Image
          src={getItemImageUrl(bootId)}
          alt={`item-${bootId}`}
          width={36}
          height={36}
          className="rounded border border-divider"
          unoptimized
        />
      </GameTooltip>
      <div className="flex items-center gap-4 ml-auto text-xs">
        <span>
          <span className="text-on-surface-medium">승률 </span>
          <span
            className={`font-medium ${winRatePercent >= 50 ? "text-win" : "text-loss"
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
