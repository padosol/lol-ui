"use client";

import { useGameDataStore } from "@/stores/useGameDataStore";

interface SpellTooltipContentProps {
  spellId: number;
}

export default function SpellTooltipContent({ spellId }: SpellTooltipContentProps) {
  const summonerData = useGameDataStore((state) => state.summonerData);

  const spell = summonerData?.data?.[String(spellId)];

  if (!spell) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[240px]">
        <div className="text-on-surface-medium text-xs">주문 정보 없음</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[240px]">
      <div className="text-on-surface font-bold text-xs">{spell.name}</div>
      {spell.cooldown && spell.cooldown.length > 0 && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">
          쿨다운: {spell.cooldown[0]}초
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
