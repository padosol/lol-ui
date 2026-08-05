"use client";

import { useTranslations } from "next-intl";

interface StatSectionHeaderProps {
  title: string;
  /** 미지정 시 "픽률 순" 을 로케일에 맞춰 사용한다. */
  sortLabel?: string;
  totalCount: number;
  visibleCount: number;
  expanded: boolean;
  onToggle: () => void;
  size?: "default" | "sub";
}

export default function StatSectionHeader({
  title,
  sortLabel,
  totalCount,
  visibleCount,
  expanded,
  onToggle,
  size = "default",
}: StatSectionHeaderProps) {
  const t = useTranslations("championStats");
  const effectiveSortLabel = sortLabel ?? t("sortByPickRate");
  const canExpand = totalCount > visibleCount;
  const showButton = canExpand || expanded;
  const titleClass =
    size === "sub"
      ? "text-sm font-medium text-on-surface-medium"
      : "text-base font-bold text-on-surface";
  const Tag = size === "sub" ? "h4" : "h3";

  return (
    <div className="flex items-end justify-between p-2">
      <div className="flex items-baseline gap-2">
        <Tag className={titleClass}>{title}</Tag>
        {totalCount > 0 && (
          <span className="text-[11px] text-on-surface-medium">
            {t("topN", { label: effectiveSortLabel, count: totalCount })}
          </span>
        )}
      </div>
      {showButton && (
        <button
          type="button"
          onClick={onToggle}
          className="text-xs text-primary hover:underline cursor-pointer"
        >
          {expanded
            ? t("collapse")
            : t("expand", { count: totalCount - visibleCount })}
        </button>
      )}
    </div>
  );
}
