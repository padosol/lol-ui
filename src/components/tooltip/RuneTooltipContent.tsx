"use client";

import { KEYSTONE_NAMES, RUNE_TREE_NAMES } from "@/constants/runes";

interface RuneTooltipContentProps {
  runeId: number;
}

export default function RuneTooltipContent({ runeId }: RuneTooltipContentProps) {
  const name = KEYSTONE_NAMES[runeId];
  const treeId = Math.floor(runeId / 100) * 100;
  const treeName = RUNE_TREE_NAMES[treeId];

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[200px]">
      <div className="text-on-surface font-bold text-xs">
        {name || `룬 ${runeId}`}
      </div>
      {treeName && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">{treeName}</div>
      )}
    </div>
  );
}
