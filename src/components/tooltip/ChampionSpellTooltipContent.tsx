"use client";

import { useGameDataStore } from "@/stores/useGameDataStore";

interface ChampionSpellTooltipContentProps {
  championName: string;
  skillIndex: number;
}

export default function ChampionSpellTooltipContent({ championName, skillIndex }: ChampionSpellTooltipContentProps) {
  const championData = useGameDataStore((state) => state.championData);

  const champion = championData?.data?.[championName];
  const spell = champion?.spells?.[skillIndex];

  if (!spell) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
        <div className="text-on-surface-medium text-xs">스킬 정보 없음</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
      <div className="text-on-surface font-bold text-xs">{spell.name}</div>
      {spell.cooldownBurn && spell.cooldownBurn !== "0" && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">
          쿨다운: {spell.cooldownBurn}초
        </div>
      )}
      {spell.costBurn && spell.costBurn !== "0" && spell.resource && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">
          소모: {spell.costBurn} ({spell.resource})
        </div>
      )}
      {spell.description && (
        <div className="text-on-surface-medium text-[10px] mt-1 leading-relaxed">
          {spell.description}
        </div>
      )}
    </div>
  );
}
