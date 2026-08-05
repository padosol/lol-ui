"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GameTooltip } from "@/shared/ui/tooltip";
import type { ItemBuildData, StartItemBuildData } from "@/entities/champion";
import { getItemImageUrl } from "@/shared/lib/game";
import Image from "next/image";
import StatSectionHeader from "./StatSectionHeader";
import BuildConfidenceIndicator from "./BuildConfidenceIndicator";

const DEFAULT_VISIBLE = 2;

interface ItemBuildStatsProps {
  data: ItemBuildData[];
  startItemBuilds?: StartItemBuildData[];
}

export default function ItemBuildStats({ data, startItemBuilds }: ItemBuildStatsProps) {
  const t = useTranslations("championStats");
  const [startExpanded, setStartExpanded] = useState(false);
  const [coreExpanded, setCoreExpanded] = useState(false);
  if (data.length === 0 && (!startItemBuilds || startItemBuilds.length === 0)) return null;

  const visibleStart = startItemBuilds
    ? startExpanded
      ? startItemBuilds
      : startItemBuilds.slice(0, DEFAULT_VISIBLE)
    : [];
  const visibleCore = coreExpanded ? data : data.slice(0, DEFAULT_VISIBLE);

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-0 md:p-5">
      <h3 className="text-base font-bold text-on-surface p-2">
        {t("sections.itemBuild")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {startItemBuilds && startItemBuilds.length > 0 && (
          <div>
            <StatSectionHeader
              title={t("sections.startingItems")}
              totalCount={startItemBuilds.length}
              visibleCount={Math.min(DEFAULT_VISIBLE, startItemBuilds.length)}
              expanded={startExpanded}
              onToggle={() => setStartExpanded((v) => !v)}
              size="sub"
            />
            <div className="space-y-2">
              {visibleStart.map((build, i) => (
                <BuildRow
                  key={i}
                  itemIds={build.startItems}
                  winRate={build.winRate}
                  games={build.games}
                  pickRate={build.pickRate}
                  sampleSize={build.sampleSize}
                  totalSampleSize={build.totalSampleSize}
                  confidenceLowerBound={build.confidenceLowerBound}
                />
              ))}
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div>
            <StatSectionHeader
              title={t("sections.coreBuild")}
              totalCount={data.length}
              visibleCount={Math.min(DEFAULT_VISIBLE, data.length)}
              expanded={coreExpanded}
              onToggle={() => setCoreExpanded((v) => !v)}
              size="sub"
            />
            <div className="space-y-2">
              {visibleCore.map((build, i) => (
                <BuildRow
                  key={i}
                  itemIds={build.itemBuild}
                  winRate={build.winRate}
                  games={build.games}
                  pickRate={build.pickRate}
                  sampleSize={build.sampleSize}
                  totalSampleSize={build.totalSampleSize}
                  confidenceLowerBound={build.confidenceLowerBound}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BuildRow({
  itemIds,
  winRate,
  games,
  pickRate,
  sampleSize,
  totalSampleSize,
  confidenceLowerBound,
}: {
  itemIds: number[];
  winRate: number;
  games: number;
  pickRate: number;
  sampleSize?: number;
  totalSampleSize?: number;
  confidenceLowerBound?: number;
}) {
  const t = useTranslations("championStats");
  const winRatePercent = winRate * 100;
  return (
    <div className="bg-surface rounded-lg px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {itemIds.map((itemId, j) => (
            <GameTooltip key={j} type="item" id={itemId}>
              <Image
                src={getItemImageUrl(itemId)}
                alt={`item-${itemId}`}
                width={36}
                height={36}
                className="rounded border border-divider"
                unoptimized
              />
            </GameTooltip>
          ))}
        </div>
        <div className="flex items-center gap-4 ml-auto text-xs">
          <span>
            <span className="text-on-surface-medium">{t("winRate")} </span>
            <span
              className={`font-medium ${winRatePercent >= 50 ? "text-win" : "text-loss"}`}
            >
              {winRatePercent.toFixed(1)}%
            </span>
          </span>
          <span>
            <span className="text-on-surface-medium">{t("pickRate")} </span>
            <span className="font-medium text-on-surface">
              {(pickRate * 100).toFixed(1)}%
            </span>
          </span>
          <span className="text-on-surface-medium">
            {t("games", { count: games })}
          </span>
        </div>
      </div>
      <div className="mt-1.5">
        <BuildConfidenceIndicator
          sampleSize={sampleSize}
          totalSampleSize={totalSampleSize}
          confidenceLowerBound={confidenceLowerBound}
        />
      </div>
    </div>
  );
}
