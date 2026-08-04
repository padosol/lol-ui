"use client";

import { useTranslations } from "next-intl";
import { useGameDataStore } from "@/shared/model/game-data";

interface ChampionSpellTooltipContentProps {
  championName: string;
  skillIndex: number;
}

export default function ChampionSpellTooltipContent({ championName, skillIndex }: ChampionSpellTooltipContentProps) {
  const t = useTranslations("tooltip");
  const championData = useGameDataStore((state) => state.championData);

  const champion = championData?.data?.[championName];
  const spell = champion?.spells?.[skillIndex];

  if (!spell) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
        <div className="text-on-surface-medium text-xs">{t("noSkillInfo")}</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[280px]">
      <div className="text-on-surface font-bold text-xs">{spell.name}</div>
      {spell.cooldownBurn && spell.cooldownBurn !== "0" && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">
          {t("cooldown", { value: spell.cooldownBurn })}
        </div>
      )}
      {spell.costBurn && spell.costBurn !== "0" && spell.resource && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">
          {t("cost", { value: spell.costBurn, resource: spell.resource })}
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
