"use client";

import { KEYSTONE_NAMES } from "@/constants/runes";
import { useGameDataStore } from "@/stores/useGameDataStore";
import { parseItemDescription } from "@/utils/parseItemDescription";

interface RuneTooltipContentProps {
  runeId: number;
}

export default function RuneTooltipContent({ runeId }: RuneTooltipContentProps) {
  const getRuneById = useGameDataStore((s) => s.getRuneById);
  const storeRune = getRuneById(runeId);

  const name = storeRune?.name ?? KEYSTONE_NAMES[runeId];

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
      <div className="text-on-surface font-bold text-xs">
        {name || `룬 ${runeId}`}
      </div>
      {storeRune?.longDesc && (
        <div className="text-on-surface-medium text-[10px] mt-1 leading-relaxed">
          {parseItemDescription(storeRune.longDesc)}
        </div>
      )}
    </div>
  );
}
