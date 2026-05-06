"use client";

import { useState } from "react";
import type { SpellStatsData } from "@/entities/champion";
import { SummonerSpellImage } from "@/shared/ui/game";
import StatSectionHeader from "./StatSectionHeader";
import BuildConfidenceIndicator from "./BuildConfidenceIndicator";

const DEFAULT_VISIBLE = 2;

interface SpellStatsProps {
  data: SpellStatsData[];
}

export default function SpellStats({ data }: SpellStatsProps) {
  const [expanded, setExpanded] = useState(false);
  if (!data || data.length === 0) return null;

  const visible = expanded ? data : data.slice(0, DEFAULT_VISIBLE);

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-0 md:p-5">
      <StatSectionHeader
        title="소환사 주문"
        totalCount={data.length}
        visibleCount={Math.min(DEFAULT_VISIBLE, data.length)}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      <div className="space-y-2">
        {visible.map((build, i) => (
          <BuildRow
            key={`${build.summoner1Id}-${build.summoner2Id}-${i}`}
            build={build}
          />
        ))}
      </div>
    </div>
  );
}

function BuildRow({ build }: { build: SpellStatsData }) {
  const winRatePercent = build.winRate * 100;
  return (
    <div className="bg-surface rounded-lg px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <SummonerSpellImage spellId={build.summoner1Id} size="small" />
          <SummonerSpellImage spellId={build.summoner2Id} size="small" />
        </div>
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
      <div className="mt-1.5">
        <BuildConfidenceIndicator
          sampleSize={build.sampleSize}
          totalSampleSize={build.totalSampleSize}
          confidenceLowerBound={build.confidenceLowerBound}
        />
      </div>
    </div>
  );
}
