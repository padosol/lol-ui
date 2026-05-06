"use client";

import { useState } from "react";
import { GameTooltip } from "@/shared/ui/tooltip";
import type { BootBuildData } from "@/entities/champion";
import { getItemImageUrl } from "@/shared/lib/game";
import Image from "next/image";
import StatSectionHeader from "./StatSectionHeader";
import BuildConfidenceIndicator from "./BuildConfidenceIndicator";

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
          <BuildRow key={i} build={build} />
        ))}
      </div>
    </div>
  );
}

function BuildRow({ build }: { build: BootBuildData }) {
  const winRatePercent = build.winRate * 100;
  return (
    <div className="bg-surface rounded-lg px-3 py-2">
      <div className="flex items-center gap-3">
        <GameTooltip type="item" id={build.bootId}>
          <Image
            src={getItemImageUrl(build.bootId)}
            alt={`item-${build.bootId}`}
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
              className={`font-medium ${winRatePercent >= 50 ? "text-win" : "text-loss"}`}
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
      <div className="mt-1.5 pl-[48px]">
        <BuildConfidenceIndicator
          sampleSize={build.sampleSize}
          totalSampleSize={build.totalSampleSize}
          confidenceLowerBound={build.confidenceLowerBound}
        />
      </div>
    </div>
  );
}
