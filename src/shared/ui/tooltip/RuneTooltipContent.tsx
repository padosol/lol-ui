"use client";

import { useTranslations } from "next-intl";
import { KEYSTONE_NAMES } from "@/shared/constants/runes";
import { useGameDataStore } from "@/shared/model/game-data";
import { parseItemDescription } from "@/shared/lib/parseItemDescription";

interface RuneTooltipContentProps {
  runeId: number;
}

export default function RuneTooltipContent({ runeId }: RuneTooltipContentProps) {
  const t = useTranslations("tooltip");
  const getRuneById = useGameDataStore((s) => s.getRuneById);
  const storeRune = getRuneById(runeId);

  const name = storeRune?.name ?? KEYSTONE_NAMES[runeId];

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
      <div className="text-on-surface font-bold text-xs">
        {name || t("rune", { id: runeId })}
      </div>
      {storeRune?.longDesc && (
        <div className="text-on-surface-medium text-[10px] mt-1 leading-relaxed">
          {parseItemDescription(storeRune.longDesc)}
        </div>
      )}
    </div>
  );
}
