"use client";

import { useTranslations } from "next-intl";
import { useGameDataStore } from "@/shared/model/game-data";

/** 번역 키가 존재하는 챔피언 태그. 그 외 태그는 원문을 그대로 노출한다. */
const CHAMPION_TAGS = [
  "Fighter",
  "Tank",
  "Mage",
  "Assassin",
  "Marksman",
  "Support",
] as const;

type ChampionTag = (typeof CHAMPION_TAGS)[number];

function isChampionTag(value: string): value is ChampionTag {
  return (CHAMPION_TAGS as readonly string[]).includes(value);
}

interface ChampionTooltipContentProps {
  championName: string;
}

export default function ChampionTooltipContent({ championName }: ChampionTooltipContentProps) {
  const t = useTranslations("domain");
  const championData = useGameDataStore((state) => state.championData);

  let champion = null;
  if (championData?.data) {
    for (const key in championData.data) {
      if (championData.data[key].id === championName) {
        champion = championData.data[key];
        break;
      }
    }
  }

  if (!champion) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-3 max-w-[260px]">
        <div className="text-on-surface font-bold text-sm">{championName}</div>
      </div>
    );
  }

  const info = champion.info;
  const stats = champion.stats;
  const tags = champion.tags || [];

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-3 max-w-[260px]">
      <div className="mb-2">
        <span className="text-on-surface font-bold text-sm">{champion.name}</span>
        {champion.title && (
          <span className="text-on-surface-medium text-xs ml-1.5">- {champion.title}</span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-6 text-on-surface-medium"
            >
              {isChampionTag(tag) ? t(`championTag.${tag}`) : tag}
            </span>
          ))}
        </div>
      )}

      {info && (
        <div className="space-y-1 mb-2">
          {([
            ["attack", info.attack, "bg-stat-low"],
            ["defense", info.defense, "bg-success"],
            ["magic", info.magic, "bg-primary"],
            ["difficulty", info.difficulty, "bg-warning"],
          ] as const).map(([key, value, color]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              {/* w-16: 영문 라벨(Difficulty)이 한국어보다 길어 폭을 넉넉히 잡는다 */}
              <span className="text-on-surface-medium w-16 shrink-0">
                {t(`championInfo.${key}`)}
              </span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-sm ${
                      i < value ? color : "bg-surface-6"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] border-t border-divider/50 pt-1.5">
          <div className="flex justify-between">
            <span className="text-on-surface-medium">HP</span>
            <span className="text-on-surface">{stats.hp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">{t("championStat.armor")}</span>
            <span className="text-on-surface">{stats.armor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">{t("championStat.magicResist")}</span>
            <span className="text-on-surface">{stats.spellblock}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">{t("championStat.moveSpeed")}</span>
            <span className="text-on-surface">{stats.movespeed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">{t("championStat.range")}</span>
            <span className="text-on-surface">{stats.attackrange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">{t("championStat.attackDamage")}</span>
            <span className="text-on-surface">{stats.attackdamage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
