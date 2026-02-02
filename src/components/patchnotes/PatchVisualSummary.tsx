"use client";

import type {
  AramChampionChange,
  ArenaChampionChange,
  ChampionChange,
  ItemChange,
} from "@/types/patchnotes";
import { getChampionImageUrl } from "@/utils/champion";
import { getItemImageUrl } from "@/utils/game";
import { ArrowDown, ArrowUp, ChevronDown, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ChampionChangeUnion = ChampionChange | ArenaChampionChange | AramChampionChange;

interface PatchVisualSummaryProps {
  champions: ChampionChangeUnion[];
  items?: ItemChange[];
}

interface ChangeEntry {
  name: string;
  imageUrl: string;
  isChampion: boolean;
  anchorId: string;
}

interface ChangeGroup {
  buffs: ChangeEntry[];
  nerfs: ChangeEntry[];
  adjusts: ChangeEntry[];
}

function groupChanges(
  champions: ChampionChangeUnion[],
  items: ItemChange[] = []
): ChangeGroup {
  const buffs: ChangeEntry[] = [];
  const nerfs: ChangeEntry[] = [];
  const adjusts: ChangeEntry[] = [];

  // 챔피언 분류
  champions.forEach((c) => {
    const entry: ChangeEntry = {
      name: c.championName,
      imageUrl: getChampionImageUrl(c.championKey),
      isChampion: true,
      anchorId: `champion-${c.championKey}`,
    };
    if (c.changeType === "buff") {
      buffs.push(entry);
    } else if (c.changeType === "nerf") {
      nerfs.push(entry);
    } else if (c.changeType === "adjust" || c.changeType === "rework") {
      adjusts.push(entry);
    }
  });

  // 아이템 분류
  items.forEach((i) => {
    const entry: ChangeEntry = {
      name: i.itemName,
      imageUrl: getItemImageUrl(i.itemId),
      isChampion: false,
      anchorId: `item-${i.itemId}`,
    };
    if (i.changeType === "buff") {
      buffs.push(entry);
    } else if (i.changeType === "nerf") {
      nerfs.push(entry);
    } else if (i.changeType === "adjust" || i.changeType === "new") {
      adjusts.push(entry);
    }
  });

  return { buffs, nerfs, adjusts };
}

interface SummaryRowProps {
  label: string;
  icon: React.ReactNode;
  iconBgClass: string;
  items: ChangeEntry[];
}

function SummaryRow({ label, icon, iconBgClass, items }: SummaryRowProps) {
  if (items.length === 0) return null;

  const handleClick = (anchorId: string) => {
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${iconBgClass} shrink-0`}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <button
            key={`${item.name}-${index}`}
            onClick={() => handleClick(item.anchorId)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`relative w-10 h-10 ${
                item.isChampion ? "rounded-full" : "rounded-md"
              } overflow-hidden border border-divider/50 bg-surface-2 group-hover:border-primary/50 transition-colors`}
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <span className="text-[10px] text-on-surface-medium text-center max-w-[48px] truncate group-hover:text-primary transition-colors">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PatchVisualSummary({
  champions,
  items = [],
}: PatchVisualSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { buffs, nerfs, adjusts } = groupChanges(champions, items);

  const hasAnyChanges = buffs.length > 0 || nerfs.length > 0 || adjusts.length > 0;

  if (!hasAnyChanges) {
    return null;
  }

  const totalCount = buffs.length + nerfs.length + adjusts.length;

  return (
    <div className="sticky top-4 z-20 bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
      {/* 헤더 - 클릭으로 접기/펼치기 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-on-surface-medium">
            패치 요약
          </h3>
          <span className="text-xs text-on-surface-medium px-2 py-0.5 rounded-full bg-surface-4">
            {totalCount}
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
        <div className="px-4 pb-4 divide-y divide-divider/30">
          <SummaryRow
            label="상향"
            icon={<ArrowUp className="w-3.5 h-3.5 text-buff" />}
            iconBgClass="bg-buff/10 text-buff"
            items={buffs}
          />
          <SummaryRow
            label="하향"
            icon={<ArrowDown className="w-3.5 h-3.5 text-nerf" />}
            iconBgClass="bg-nerf/10 text-nerf"
            items={nerfs}
          />
          <SummaryRow
            label="조정"
            icon={<RefreshCw className="w-3.5 h-3.5 text-adjust" />}
            iconBgClass="bg-adjust/10 text-adjust"
            items={adjusts}
          />
        </div>
      )}
    </div>
  );
}
