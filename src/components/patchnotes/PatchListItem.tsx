"use client";

import type { PatchVersion } from "@/types/patchnotes";

interface PatchListItemProps {
  patch: PatchVersion;
  isSelected: boolean;
  onClick: () => void;
}

export default function PatchListItem({
  patch,
  isSelected,
  onClick,
}: PatchListItemProps) {
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? "bg-primary/20 border-l-4 border-primary"
          : "bg-surface-2 hover:bg-surface-4 border-l-4 border-transparent"
      }`}
    >
      <div className="flex flex-col gap-1">
        {/* 버전 */}
        <span
          className={`font-bold text-lg ${
            isSelected ? "text-primary" : "text-on-surface"
          }`}
        >
          패치 {patch.version}
        </span>

        {/* 날짜 */}
        <span className="text-xs text-on-surface-medium">
          {formatDate(patch.releaseDate)}
        </span>

        {/* 하이라이트 (있는 경우) */}
        {patch.highlights && patch.highlights.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {patch.highlights.slice(0, 2).map((highlight, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-surface-4 text-on-surface-medium truncate max-w-[100px]"
              >
                {highlight}
              </span>
            ))}
            {patch.highlights.length > 2 && (
              <span className="text-xs text-on-surface-disabled">
                +{patch.highlights.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
