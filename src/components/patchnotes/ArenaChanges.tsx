"use client";

import type { ArenaChanges as ArenaChangesType } from "@/types/patchnotes";
import { getChampionImageUrl } from "@/utils/champion";
import { ChevronDown, Swords } from "lucide-react";
import { useState } from "react";
import ChangeCard from "./ChangeCard";

interface ArenaChangesProps {
  changes: ArenaChangesType;
}

export default function ArenaChanges({ changes }: ArenaChangesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChampions = changes.champions.length > 0;
  const hasSystems = changes.systems.length > 0;

  if (!hasChampions && !hasSystems) {
    return null;
  }

  const totalChanges = changes.champions.length + changes.systems.length;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-warning" />
          <span className="text-lg font-bold text-on-surface">
            아레나 변경사항
          </span>
          <span className="text-sm text-on-surface-medium px-2 py-0.5 rounded-full bg-surface-4">
            {totalChanges}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-on-surface-medium transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {hasChampions && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-on-surface-medium px-1">
                챔피언 ({changes.champions.length})
              </h4>
              {changes.champions.map((change, index) => (
                <ChangeCard
                  key={`arena-champion-${change.championKey}-${index}`}
                  id={`arena-champion-${change.championKey}`}
                  name={change.championName}
                  imageUrl={getChampionImageUrl(change.championKey)}
                  changeType={change.changeType}
                  summary={change.summary}
                  details={change.details}
                />
              ))}
            </div>
          )}

          {hasSystems && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-on-surface-medium px-1">
                시스템 ({changes.systems.length})
              </h4>
              {changes.systems.map((change, index) => (
                <ChangeCard
                  key={`arena-system-${change.category}-${index}`}
                  id={`arena-system-${change.category.replace(/\s+/g, "-")}`}
                  name={change.category}
                  changeType={change.changeType}
                  summary={change.summary}
                  details={change.details}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
