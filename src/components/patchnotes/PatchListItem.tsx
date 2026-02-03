"use client";

import type { PatchVersionListItem } from "@/types/patchnotes";

interface PatchListItemProps {
  patch: PatchVersionListItem;
  isSelected: boolean;
  onClick: () => void;
}

export default function PatchListItem({
  patch,
  isSelected,
  onClick,
}: PatchListItemProps) {
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
        {/* 타이틀 */}
        <span
          className={`font-bold text-lg ${
            isSelected ? "text-primary" : "text-on-surface"
          }`}
        >
          {patch.title}
        </span>
      </div>
    </button>
  );
}
