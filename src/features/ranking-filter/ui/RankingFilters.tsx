"use client";

import { useTierCutoffs } from "@/entities/ranking";
import { AVAILABLE_REGIONS, type RegionValue } from "@/features/region-select";
import { getTierImageUrl } from "@/shared/lib/tier";
import { useClickOutside } from "@/shared/lib/useClickOutside";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";

interface RankingFiltersProps {
  region: RegionValue;
  queueType: string;
  onRegionChange: (region: RegionValue) => void;
  onQueueTypeChange: (queueType: string) => void;
}

const queueTypes = [
  { value: "solo", messageKey: "RANKED_SOLO_5x5" },
  { value: "flex", messageKey: "RANKED_FLEX_SR" },
] as const;

const getQueueParam = (
  queueType: string
): "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" => {
  return queueType === "flex" ? "RANKED_FLEX_SR" : "RANKED_SOLO_5x5";
};

const getLpChangeDisplay = (lpChange: number | undefined) => {
  if (lpChange === undefined) return null;

  if (lpChange === 0) {
    return <span className="text-on-surface-medium text-xs ml-1">-</span>;
  }

  if (lpChange > 0) {
    return (
      <span className="flex items-center text-win text-xs ml-1">
        <ChevronUp className="w-3 h-3" />
        {lpChange}
      </span>
    );
  }
  return (
    <span className="flex items-center text-loss text-xs ml-1">
      <ChevronDown className="w-3 h-3" />
      {Math.abs(lpChange)}
    </span>
  );
};

export default function RankingFilters({
  region,
  queueType,
  onRegionChange,
  onQueueTypeChange,
}: RankingFiltersProps) {
  const t = useTranslations("leaderboards");
  const tRegion = useTranslations("domain.region");
  const tQueue = useTranslations("domain.leagueType");
  const tTier = useTranslations("domain.tier");
  const queueParam = getQueueParam(queueType);
  const { data: tierCutoffs, isLoading, isError } = useTierCutoffs(region, queueParam);

  const challengerData = tierCutoffs?.find((t) => t.tier === "CHALLENGER");
  const grandmasterData = tierCutoffs?.find((t) => t.tier === "GRANDMASTER");
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isQueueTypeOpen, setIsQueueTypeOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const queueTypeRef = useRef<HTMLDivElement>(null);

  useClickOutside(regionRef, () => setIsRegionOpen(false), isRegionOpen);
  useClickOutside(queueTypeRef, () => setIsQueueTypeOpen(false), isQueueTypeOpen);

  const selectedRegion = AVAILABLE_REGIONS.find((r) => r.value === region);
  const selectedQueueTypeLabel = tQueue(getQueueParam(queueType));

  return (
    <div className="bg-surface-1 border border-divider rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-32">
            <label className="block text-sm font-medium text-on-surface mb-2">
              {t("region")}
            </label>
            <div ref={regionRef} className="relative">
              <button
                type="button"
                onClick={() => setIsRegionOpen((v) => !v)}
                className="w-full bg-surface-2 hover:bg-surface-4 text-on-surface border border-divider rounded-md px-3 py-2 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isRegionOpen}
              >
                <span className="text-sm">
                  {tRegion(region)}{" "}
                  <span className="text-on-surface-medium">
                    {selectedRegion?.subLabel}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-medium transition-transform ${isRegionOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-md shadow-lg z-50 overflow-hidden">
                  <div
                    className="py-1"
                    role="listbox"
                    aria-label={t("regionSelect")}
                  >
                    {AVAILABLE_REGIONS.map((r) => {
                      const selected = r.value === region;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            onRegionChange(r.value);
                            setIsRegionOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${selected
                            ? "bg-surface-8 text-on-surface"
                            : "text-on-surface hover:bg-surface-8"
                            }`}
                          role="option"
                          aria-selected={selected}
                        >
                          {tRegion(r.value)}{" "}
                          <span className="text-on-surface-medium">
                            {r.subLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-on-surface mb-2">
              {t("queueType")}
            </label>
            <div ref={queueTypeRef} className="relative">
              <button
                type="button"
                onClick={() => setIsQueueTypeOpen((v) => !v)}
                className="w-full bg-surface-2 hover:bg-surface-4 text-on-surface border border-divider rounded-md px-3 py-2 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isQueueTypeOpen}
              >
                <span className="text-sm">{selectedQueueTypeLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-medium transition-transform ${isQueueTypeOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isQueueTypeOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-md shadow-lg z-50 overflow-hidden">
                  <div
                    className="py-1"
                    role="listbox"
                    aria-label={t("queueTypeSelect")}
                  >
                    {queueTypes.map((q) => {
                      const selected = q.value === queueType;
                      return (
                        <button
                          key={q.value}
                          type="button"
                          onClick={() => {
                            onQueueTypeChange(q.value);
                            setIsQueueTypeOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${selected
                            ? "bg-surface-8 text-on-surface"
                            : "text-on-surface hover:bg-surface-8"
                            }`}
                          role="option"
                          aria-selected={selected}
                        >
                          {tQueue(q.messageKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 sm:w-[350px]">
          {isLoading ? (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="flex-1 bg-surface-2 border border-divider rounded-lg overflow-hidden animate-pulse">
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-12 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <div className="h-3 bg-surface-12 rounded w-14" />
                      <div className="h-3.5 bg-surface-12 rounded w-12" />
                      <div className="h-2.5 bg-surface-12 rounded w-10" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : isError ? (
            <div className="bg-surface-2 border border-divider rounded-lg p-3 text-sm text-on-surface-medium">
              {t("cutoffError")}
            </div>
          ) : (
            <>
              {[
                { tier: "CHALLENGER" as const, data: challengerData },
                { tier: "GRANDMASTER" as const, data: grandmasterData },
              ].map(({ tier, data }) => (
                <div
                  key={tier}
                  className="flex-1 bg-surface-2 border border-divider rounded-lg overflow-hidden"
                >
                  <div className="p-3 flex items-center justify-between">
                    <div className="w-[54px] h-[54px] shrink-0 overflow-hidden">
                      <Image
                        src={getTierImageUrl(tier)}
                        alt={tTier(tier)}
                        width={54}
                        height={60}
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-on-surface-medium">
                        {tTier(tier)}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-on-surface">
                          {data?.minLeaguePoints ?? "-"}
                        </span>
                        <span className="text-[10px] text-on-surface-medium ml-1">LP</span>
                        {getLpChangeDisplay(data?.lpChange)}
                      </div>
                      {data?.userCount !== undefined && (
                        <div className="text-[11px] text-on-surface-medium">
                          {t("userCount", { count: data.userCount })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
