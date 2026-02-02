"use client";

import { usePatchVersions } from "@/hooks/usePatchNotes";
import PatchListItem from "./PatchListItem";

interface PatchListProps {
  selectedVersion: string | null;
  onSelectVersion: (version: string) => void;
}

export default function PatchList({
  selectedVersion,
  onSelectVersion,
}: PatchListProps) {
  const { data: patches, isLoading, error } = usePatchVersions();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-20 bg-surface-2 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-surface-2 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium text-sm">
          패치 목록을 불러오는데 실패했습니다.
        </p>
      </div>
    );
  }

  if (!patches || patches.length === 0) {
    return (
      <div className="p-4 bg-surface-2 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium text-sm">
          패치노트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {patches.map((patch) => (
        <PatchListItem
          key={patch.version}
          patch={patch}
          isSelected={selectedVersion === patch.version}
          onClick={() => onSelectVersion(patch.version)}
        />
      ))}
    </div>
  );
}
