"use client";

import { useState } from "react";
import type { ChampionPositionStats } from "@/entities/champion";
import {
  getChampionImageUrl,
  getChampionNameByEnglishName,
  getTierBadgeClass,
} from "@/entities/champion";
import { getChampionPassiveImageUrl } from "@/shared/lib/game";
import { IMAGE_HOST } from "@/shared/config/image";
import { GameTooltip } from "@/shared/ui/tooltip";
import { useGameDataStore } from "@/shared/model/game-data";
import Image from "next/image";

const SKILL_KEYS = ["Q", "W", "E", "R"] as const;
const NA = "-";

interface ChampionOverviewProps {
  data: ChampionPositionStats;
  tier: string;
  championId: string;
}

function formatRate(value: number | null | undefined): string {
  if (value == null) return NA;
  return `${(value * 100).toFixed(1)}%`;
}

function formatAvg(value: number | null | undefined, digits = 1): string {
  if (value == null) return NA;
  return value.toFixed(digits);
}

function formatGpm(value: number | null | undefined): string {
  if (value == null) return NA;
  return `${Math.round(value).toLocaleString()} G/min`;
}

function formatCs(
  position: string,
  laneCs: number | null | undefined,
  jungleCs: number | null | undefined
): string {
  if (position === "JUNGLE") {
    return jungleCs != null ? `${jungleCs.toFixed(1)} (jg)` : NA;
  }
  return laneCs != null ? `${laneCs.toFixed(1)} (lane)` : NA;
}

export default function ChampionOverview({
  data,
  tier,
  championId,
}: ChampionOverviewProps) {
  const championData = useGameDataStore((s) => s.championData);
  const champion = championData?.data[championId];
  const championDisplayName = getChampionNameByEnglishName(championId);

  // per-position tier 우선, fallback 으로 top-level tier
  const displayedTier = data.tier ?? tier;
  const averages = data.averages;
  const hasAverages = !!averages;

  const kdaLabel = hasAverages
    ? `${formatAvg(averages?.avgKills)} / ${formatAvg(averages?.avgDeaths)} / ${formatAvg(averages?.avgAssists)}`
    : "표본 부족";
  const kdaScore = hasAverages ? `KDA ${formatAvg(averages?.kda, 2)}` : "";

  const wins = Math.round(data.totalGames * data.winRate);
  const losses = data.totalGames - wins;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-3 sm:p-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <GameTooltip type="champion" id={championId}>
          <Image
            src={getChampionImageUrl(championId)}
            alt={championDisplayName}
            width={64}
            height={64}
            className="rounded-lg shrink-0"
            unoptimized
          />
        </GameTooltip>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-on-surface truncate">
              {championDisplayName}
            </h2>
            <span
              className={`shrink-0 px-2 py-0.5 text-xs font-bold rounded ${getTierBadgeClass(displayedTier)}`}
            >
              {displayedTier}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
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

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-divider/50">
        <StatCard
          label="승률"
          value={formatRate(data.winRate)}
          valueClass={data.winRate >= 0.5 ? "text-win" : "text-loss"}
        />
        <StatCard label="픽률" value={formatRate(data.pickRate)} />
        <StatCard label="밴률" value={formatRate(data.banRate)} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <StatCard
          label="게임수"
          value={data.totalGames.toLocaleString()}
        />
        <StatCard label="승리" value={wins.toLocaleString()} />
        <StatCard label="패배" value={losses.toLocaleString()} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <StatCard
          label="K / D / A"
          value={kdaLabel}
          subValue={kdaScore}
        />
        <StatCard
          label="분당 골드"
          value={formatGpm(averages?.avgGoldPerMinute)}
        />
        <StatCard
          label="10분 CS"
          value={formatCs(data.teamPosition, averages?.avgLaneCs10m, averages?.avgJungleCs10m)}
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
  subValue,
  valueClass = "text-on-surface",
}: {
  label: string;
  value: string;
  subValue?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-on-surface-medium text-[11px]">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
      {subValue && (
        <span className="text-[10px] text-on-surface-medium">{subValue}</span>
      )}
    </div>
  );
}
