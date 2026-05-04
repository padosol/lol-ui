"use client";

import { useState } from "react";
import type { ChampionPositionStats } from "@/entities/champion";
import {
  getChampionImageUrl,
  getChampionNameByEnglishName,
} from "@/entities/champion";
import { getChampionPassiveImageUrl } from "@/shared/lib/game";
import { IMAGE_HOST } from "@/shared/config/image";
import { GameTooltip } from "@/shared/ui/tooltip";
import { useGameDataStore } from "@/shared/model/game-data";
import Image from "next/image";

const TIER_COLORS: Record<string, string> = {
  "S+": "bg-red-500 text-white",
  S: "bg-orange-500 text-white",
  A: "bg-yellow-500 text-surface",
  B: "bg-green-500 text-white",
  C: "bg-blue-500 text-white",
  D: "bg-gray-500 text-white",
};

const SKILL_KEYS = ["Q", "W", "E", "R"] as const;

interface ChampionOverviewProps {
  data: ChampionPositionStats;
  tier: string;
  championId: string;
}

export default function ChampionOverview({
  data,
  tier,
  championId,
}: ChampionOverviewProps) {
  const championData = useGameDataStore((s) => s.championData);
  const champion = championData?.data[championId];

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <div className="grid grid-cols-[64px_1fr_auto] gap-x-4 gap-y-1">
        {/* 챔피언 이미지 - row 1~2 */}
        <div className="row-span-2 flex items-center">
          <GameTooltip type="champion" id={championId}>
            <Image
              src={getChampionImageUrl(championId)}
              alt={championId}
              width={64}
              height={64}
              className="rounded-lg"
              unoptimized
            />
          </GameTooltip>
        </div>

        {/* 챔피언명 */}
        <h2 className="text-xl font-bold text-on-surface self-end">
          {getChampionNameByEnglishName(championId)}
        </h2>
        {/* 승률 */}
        <StatCard
          label="승률"
          value={`${(data.winRate * 100).toFixed(1)}%`}
          valueClass={data.winRate >= 0.5 ? "text-win" : "text-loss"}
        />

        {/* 티어 */}
        <div className="self-start">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded ${
              TIER_COLORS[tier] || TIER_COLORS["D"]
            }`}
          >
            {tier}
          </span>
        </div>
        {/* 승리 */}
        <StatCard
          label="승리"
          value={Math.round(data.totalGames * data.winRate).toLocaleString()}
        />

        {/* 스킬 아이콘들 */}
        <div className="col-span-2 flex items-center gap-1.5">
          {champion?.passive && (
            <GameTooltip type="championPassive" id={championId}>
              <div>
                <SkillIcon
                  src={getChampionPassiveImageUrl(champion.passive.image.full)}
                  label="P"
                  alt={champion.passive.name}
                />
              </div>
            </GameTooltip>
          )}
          {SKILL_KEYS.map((key, index) => (
            <GameTooltip
              key={key}
              type="championSpell"
              id={`${championId}:${index}`}
              disabled={!champion}
            >
              <div>
                <SkillIcon
                  src={
                    champion?.spells?.[index]?.image.full
                      ? `${IMAGE_HOST}/spells/${champion.spells[index].image.full}`
                      : `${IMAGE_HOST}/spells/${championId}${key}.png`
                  }
                  label={key}
                  alt={champion?.spells?.[index]?.name ?? `${championId} ${key}`}
                />
              </div>
            </GameTooltip>
          ))}
        </div>
        {/* 게임수 */}
        <StatCard
          label="게임수"
          value={data.totalGames.toLocaleString()}
        />
      </div>
    </div>
  );
}

function SkillIcon({
  src,
  label,
  alt,
}: {
  src: string;
  label: string;
  alt: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className="w-8 h-8 rounded bg-surface flex items-center justify-center text-[10px] font-bold text-on-surface-medium">
        {label}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      className="rounded"
      unoptimized
      onError={() => setImgError(true)}
    />
  );
}

function StatCard({
  label,
  value,
  valueClass = "text-on-surface",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 self-center justify-self-end">
      <span className="text-on-surface-medium text-xs">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
