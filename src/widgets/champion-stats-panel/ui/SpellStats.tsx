"use client";

import type { SpellStatsData } from "@/entities/champion";
import { SummonerSpellImage } from "@/shared/ui/game";

interface SpellStatsProps {
  data: SpellStatsData[];
}

export default function SpellStats({ data }: SpellStatsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-0 md:p-5">
      <h3 className="text-base font-bold text-on-surface p-2">소환사 주문</h3>
      <div className="space-y-2">
        {data.map((build, i) => (
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
