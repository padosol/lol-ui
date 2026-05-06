"use client";

import { useState } from "react";
import type { SpellStatsData } from "@/entities/champion";
import { SummonerSpellImage } from "@/shared/ui/game";
import StatSectionHeader from "./StatSectionHeader";

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
            summoner1Id={build.summoner1Id}
            summoner2Id={build.summoner2Id}
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
  summoner1Id,
  summoner2Id,
  winRate,
  games,
  pickRate,
}: {
  summoner1Id: number;
  summoner2Id: number;
  winRate: number;
  games: number;
  pickRate: number;
}) {
  const winRatePercent = winRate * 100;
  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        <SummonerSpellImage spellId={summoner1Id} size="small" />
        <SummonerSpellImage spellId={summoner2Id} size="small" />
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
