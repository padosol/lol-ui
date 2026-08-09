"use client";

import { useTranslations } from "next-intl";

interface BuildConfidenceIndicatorProps {
  sampleSize?: number;
  totalSampleSize?: number;
  confidenceLowerBound?: number; // 0~1
}

type ConfidenceLevel = "low" | "mid" | "high" | "unknown";

function levelOf(value: number | undefined): ConfidenceLevel {
  if (value == null || value <= 0) return "unknown";
  if (value < 0.45) return "low";
  if (value < 0.55) return "mid";
  return "high";
}

const LEVEL_BAR: Record<ConfidenceLevel, string> = {
  low: "bg-gray-500",
  mid: "bg-amber-400",
  high: "bg-emerald-500",
  unknown: "bg-surface-4",
};

const LEVEL_TEXT: Record<ConfidenceLevel, string> = {
  low: "text-on-surface-medium",
  mid: "text-amber-400",
  high: "text-emerald-500",
  unknown: "text-on-surface-medium",
};

export default function BuildConfidenceIndicator({
  sampleSize,
  totalSampleSize,
  confidenceLowerBound,
}: BuildConfidenceIndicatorProps) {
  const t = useTranslations("championStats.confidence");
  const level = levelOf(confidenceLowerBound);
  const sampleLabel =
    sampleSize != null ? t("sample", { count: sampleSize }) : null;
  const ratio =
    totalSampleSize && totalSampleSize > 0 && sampleSize != null
      ? (sampleSize / totalSampleSize) * 100
      : null;

  // 어떤 표시 데이터도 없으면 렌더 X
  if (sampleLabel == null && confidenceLowerBound == null) return null;

  return (
    <div className="flex items-center gap-2 text-[11px] text-on-surface-medium">
      {sampleLabel && (
        <span>
          {sampleLabel}
          {ratio != null && (
            <span className="ml-1 opacity-70">
              {t("ratio", { value: ratio.toFixed(1) })}
            </span>
          )}
        </span>
      )}
      {confidenceLowerBound != null && (
        <span className="flex items-center gap-1">
          <span className="inline-block w-10 h-1 bg-surface-4 rounded-full overflow-hidden">
            <span
              className={`block h-full ${LEVEL_BAR[level]}`}
              style={{
                width: `${Math.max(0, Math.min(1, confidenceLowerBound)) * 100}%`,
              }}
            />
          </span>
          <span className={`text-[10px] font-medium ${LEVEL_TEXT[level]}`}>
            {t("label", {
              level: t(level),
              value: (confidenceLowerBound * 100).toFixed(1),
            })}
          </span>
        </span>
      )}
    </div>
  );
}
