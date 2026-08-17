"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { getNextLowerTier, useTierLabel } from "@/features/champion-stats-filter";

function formatTime(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

interface ErrorStateProps {
  errorUpdatedAt: number;
  onRetry: () => void;
}

export function ErrorState({ errorUpdatedAt, onRetry }: ErrorStateProps) {
  const t = useTranslations("championStats");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-loss text-sm">{t("loadError")}</p>
      {errorUpdatedAt > 0 && (
        <p className="text-on-surface-medium text-xs">
          {t("lastAttempt", { time: formatTime(errorUpdatedAt) })}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg text-sm text-on-surface cursor-pointer focus:outline-none"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {tCommon("retry")}
      </button>
    </div>
  );
}

interface EmptyStateProps {
  selectedTier: string;
  selectedPatch: string;
  patchVersions: string[];
  onTierChange: (tier: string) => void;
  onPatchChange: (patch: string) => void;
}

export function EmptyState({
  selectedTier,
  selectedPatch,
  patchVersions,
  onTierChange,
  onPatchChange,
}: EmptyStateProps) {
  const t = useTranslations("championStats");
  const tierLabel = useTierLabel();
  const lowerTier = getNextLowerTier(selectedTier);
  const activePatch = selectedPatch || patchVersions[0] || "";
  const currentPatchIdx = patchVersions.indexOf(activePatch);
  const previousPatch =
    currentPatchIdx >= 0 && currentPatchIdx < patchVersions.length - 1
      ? patchVersions[currentPatchIdx + 1]
      : null;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-on-surface-medium text-sm">{t("emptyTitle")}</p>
      <p className="text-on-surface-medium text-xs">
        {tierLabel(selectedTier)} · {activePatch || t("latestPatch")}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {lowerTier && (
          <button
            type="button"
            onClick={() => onTierChange(lowerTier)}
            className="px-3 py-1.5 bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg text-sm text-on-surface cursor-pointer focus:outline-none"
          >
            {t("viewTier", { tier: tierLabel(lowerTier) })}
          </button>
        )}
        {previousPatch && (
          <button
            type="button"
            onClick={() => onPatchChange(previousPatch)}
            className="px-3 py-1.5 bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg text-sm text-on-surface cursor-pointer focus:outline-none"
          >
            {t("viewPreviousPatch", { patch: previousPatch })}
          </button>
        )}
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard heightClass="h-[180px]" />
        <SkeletonCard heightClass="h-[180px]" />
      </div>
      <SkeletonCard heightClass="h-[140px]" />
      <SkeletonCard heightClass="h-[120px]" />
    </div>
  );
}

function SkeletonCard({ heightClass }: { heightClass: string }) {
  return (
    <div
      className={`bg-surface-1 rounded-lg border border-divider ${heightClass}`}
    />
  );
}
