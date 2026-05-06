"use client";

import { RotateCcw } from "lucide-react";
import { getNextLowerTier, getTierLabel } from "@/features/champion-stats-filter";

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
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-loss text-sm">통계 데이터를 불러오지 못했습니다.</p>
      {errorUpdatedAt > 0 && (
        <p className="text-on-surface-medium text-xs">
          마지막 시도 {formatTime(errorUpdatedAt)}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg text-sm text-on-surface cursor-pointer focus:outline-none"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        재시도
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
  const lowerTier = getNextLowerTier(selectedTier);
  const activePatch = selectedPatch || patchVersions[0] || "";
  const currentPatchIdx = patchVersions.indexOf(activePatch);
  const previousPatch =
    currentPatchIdx >= 0 && currentPatchIdx < patchVersions.length - 1
      ? patchVersions[currentPatchIdx + 1]
      : null;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-on-surface-medium text-sm">
        선택한 조건의 통계가 없습니다.
      </p>
      <p className="text-on-surface-medium text-xs">
        {getTierLabel(selectedTier)} · {activePatch || "최신"}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {lowerTier && (
          <button
            type="button"
            onClick={() => onTierChange(lowerTier.value)}
            className="px-3 py-1.5 bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg text-sm text-on-surface cursor-pointer focus:outline-none"
          >
            {lowerTier.label} 보기
          </button>
        )}
        {previousPatch && (
          <button
            type="button"
            onClick={() => onPatchChange(previousPatch)}
            className="px-3 py-1.5 bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg text-sm text-on-surface cursor-pointer focus:outline-none"
          >
            이전 패치 ({previousPatch}) 보기
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
