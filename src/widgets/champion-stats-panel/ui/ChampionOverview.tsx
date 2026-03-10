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
  OP: "bg-red-500 text-white",
  "1": "bg-orange-500 text-white",
  "2": "bg-yellow-500 text-surface",
  "3": "bg-green-500 text-white",
  "4": "bg-blue-500 text-white",
  "5": "bg-gray-500 text-white",
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
      <div className="grid grid-cols-[1fr_auto] gap-4">
      <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Image
          src={getChampionImageUrl(championId)}
          alt={championId}
          width={64}
          height={64}
          className="rounded-lg"
          unoptimized
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-on-surface">
              {getChampionNameByEnglishName(championId)}
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                TIER_COLORS[tier] || TIER_COLORS["5"]
              }`}
            >
              {tier === "OP" ? "OP" : `Tier ${tier}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
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
        </div>
      </div>
      </div>

      <div className="flex flex-col gap-2">
        <StatCard
          label="승률"
          value={`${(data.winRate * 100).toFixed(1)}%`}
          valueClass={data.winRate >= 0.5 ? "text-win" : "text-loss"}
        />
        <StatCard
          label="승리"
          value={Math.round(data.totalGames * data.winRate).toLocaleString()}
        />
        <StatCard
          label="게임수"
          value={data.totalGames.toLocaleString()}
        />
      </div>
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
      <div className="w-7 h-7 rounded bg-surface flex items-center justify-center text-[10px] font-bold text-on-surface-medium">
        {label}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={28}
      height={28}
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
    <div className="bg-surface rounded-lg px-3 py-2 flex items-center justify-between gap-3 min-w-[120px]">
      <span className="text-on-surface-medium text-xs">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
