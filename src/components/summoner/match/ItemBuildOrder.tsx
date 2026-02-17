import GameTooltip from "@/components/tooltip/GameTooltip";
import type { ItemSeqEntry } from "@/types/api";
import { getItemImageUrl } from "@/utils/game";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

export default function ItemBuildOrder({ itemSeq }: { itemSeq: ItemSeqEntry[] | null }) {
  if (!itemSeq || itemSeq.length === 0) {
    return (
      <div className="text-on-surface-medium text-[11px]">
        아이템 빌드 순서 정보 없음
      </div>
    );
  }

  // 인접한 같은 minute끼리 그룹화 (순서 보존)
  const groups: ItemSeqEntry[][] = [];
  for (const entry of itemSeq) {
    const last = groups[groups.length - 1];
    if (last && last[0].minute === entry.minute) {
      last.push(entry);
    } else {
      groups.push([entry]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {groups.map((group, groupIdx) => (
        <div key={groupIdx} className="flex items-center">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-on-surface-medium leading-none">
              {group[0].minute}m
            </span>
            <div className="flex items-center gap-0.5">
              {group.map((entry, idx) => (
                <GameTooltip key={idx} type="item" id={entry.itemId} disabled={entry.itemId <= 0}>
                  <div className="w-6 h-6 bg-surface-4 rounded border border-divider/50 overflow-hidden relative shrink-0">
                    {entry.itemId > 0 ? (
                      <Image
                        src={getItemImageUrl(entry.itemId)}
                        alt={`Item ${entry.itemId}`}
                        fill
                        sizes="24px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-4/50" />
                    )}
                  </div>
                </GameTooltip>
              ))}
            </div>
          </div>
          {groupIdx < groups.length - 1 && (
            <ChevronRight className="w-3 h-3 text-on-surface-medium/50 shrink-0 ml-0.5" />
          )}
        </div>
      ))}
    </div>
  );
}
