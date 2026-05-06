"use client";

interface StatSectionHeaderProps {
  title: string;
  sortLabel?: string;
  totalCount: number;
  visibleCount: number;
  expanded: boolean;
  onToggle: () => void;
  size?: "default" | "sub";
}

export default function StatSectionHeader({
  title,
  sortLabel = "픽률 순",
  totalCount,
  visibleCount,
  expanded,
  onToggle,
  size = "default",
}: StatSectionHeaderProps) {
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
            {sortLabel} 상위 {totalCount}개
          </span>
        )}
      </div>
      {showButton && (
        <button
          type="button"
          onClick={onToggle}
          className="text-xs text-primary hover:underline cursor-pointer"
        >
          {expanded ? "접기" : `더보기 (${totalCount - visibleCount})`}
        </button>
      )}
    </div>
  );
}
