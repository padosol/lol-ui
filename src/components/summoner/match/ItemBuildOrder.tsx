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

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {itemSeq.map((entry, idx) => (
        <div key={idx} className="flex items-center">
          <GameTooltip type="item" id={entry.itemId} disabled={entry.itemId <= 0}>
            <div className="w-6 h-6 bg-surface-4 rounded border border-divider/50 overflow-hidden relative shrink-0">
              {entry.itemId > 0 ? (
                <>
                  <Image
                    src={getItemImageUrl(entry.itemId)}
                    alt={`Item ${entry.itemId}`}
                    fill
                    sizes="24px"
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] text-center leading-tight">
                    {entry.minute}m
                  </span>
                </>
              ) : (
                <div className="w-full h-full bg-surface-4/50" />
              )}
            </div>
          </GameTooltip>
          {idx < itemSeq.length - 1 && (
            <ChevronRight className="w-3 h-3 text-on-surface-medium/50 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
