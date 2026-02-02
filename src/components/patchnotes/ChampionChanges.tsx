"use client";

import type { ChampionChange } from "@/types/patchnotes";
import { getChampionImageUrl } from "@/utils/champion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import ChangeCard from "./ChangeCard";

interface ChampionChangesProps {
  changes: ChampionChange[];
}

export default function ChampionChanges({ changes }: ChampionChangesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (changes.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
      {/* 섹션 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-on-surface">
            챔피언 변경사항
          </span>
          <span className="text-sm text-on-surface-medium px-2 py-0.5 rounded-full bg-surface-4">
            {changes.length}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-on-surface-medium transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 내용 */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-2">
          {changes.map((change, index) => (
            <ChangeCard
              key={`${change.championId}-${index}`}
              name={change.championName}
              imageUrl={getChampionImageUrl(change.championName)}
              changeType={change.changeType}
              summary={change.summary}
              details={change.details}
            />
          ))}
        </div>
      )}
    </div>
  );
}
