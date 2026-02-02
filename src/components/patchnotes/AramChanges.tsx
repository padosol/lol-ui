"use client";

import type { AramChanges as AramChangesType } from "@/types/patchnotes";
import { getChampionImageUrl } from "@/utils/champion";
import ChangeCard from "./ChangeCard";

interface AramChangesProps {
  changes: AramChangesType;
}

export default function AramChanges({ changes }: AramChangesProps) {
  const hasChampions = changes.champions.length > 0;
  const hasSystems = changes.systems.length > 0;

  if (!hasChampions && !hasSystems) {
    return null;
  }

  return (
    <div className="space-y-4">
      {hasChampions && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-on-surface-medium px-1">
            챔피언 ({changes.champions.length})
          </h4>
          {changes.champions.map((change, index) => (
            <ChangeCard
              key={`aram-champion-${change.championId}-${index}`}
              id={`aram-champion-${change.championKey}`}
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
              key={`aram-system-${change.category}-${index}`}
              id={`aram-system-${change.category.replace(/\s+/g, "-")}`}
              name={change.category}
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
