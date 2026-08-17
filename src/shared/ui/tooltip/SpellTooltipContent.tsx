"use client";

import { useTranslations } from "next-intl";
import { useGameDataStore } from "@/shared/model/game-data";

interface SpellTooltipContentProps {
  spellId: number;
}

export default function SpellTooltipContent({ spellId }: SpellTooltipContentProps) {
  const t = useTranslations("tooltip");
  const spell = useGameDataStore((state) => state.getSpellByNumericId(spellId));

  if (!spell) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[240px]">
        <div className="text-on-surface-medium text-xs">{t("noSpellInfo")}</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[240px]">
      <div className="text-on-surface font-bold text-xs">{spell.name}</div>
      {spell.cooldown && spell.cooldown.length > 0 && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">
          {t("cooldown", { value: spell.cooldown[0] })}
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
