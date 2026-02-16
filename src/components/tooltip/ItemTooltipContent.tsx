"use client";

import { useGameDataStore } from "@/stores/useGameDataStore";
import { parseItemDescription } from "@/utils/parseItemDescription";

interface ItemTooltipContentProps {
  itemId: number;
}

export default function ItemTooltipContent({ itemId }: ItemTooltipContentProps) {
  const itemData = useGameDataStore((state) => state.itemData);
  const item = itemData?.data[String(itemId)];

  if (!item) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-3 max-w-[280px]">
        <div className="text-on-surface-medium text-xs">아이템 정보 없음</div>
      </div>
    );
  }

  const parsed = parseItemDescription(item.description);

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-3 max-w-[280px]">
      {/* 이름 + 골드 */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-on-surface font-bold text-sm">{item.name}</span>
        <span className="text-gold text-xs shrink-0">
          {item.gold.total}g
          {item.gold.sell > 0 && (
            <span className="text-on-surface-disabled ml-1">({item.gold.sell})</span>
          )}
        </span>
      </div>

      {/* 설명 */}
      <div className="text-on-surface-medium text-xs leading-relaxed">
        {parsed}
      </div>

      {/* plaintext */}
      {item.plaintext && (
        <div className="text-on-surface-disabled text-[11px] mt-1.5 pt-1.5 border-t border-divider/50 italic">
          {item.plaintext}
        </div>
      )}
    </div>
  );
}
