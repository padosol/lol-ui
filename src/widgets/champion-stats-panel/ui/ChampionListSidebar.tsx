"use client";

import { useGameDataStore } from "@/shared/model/game-data";
import { getChampionImageUrl, getChampionNameByEnglishName } from "@/entities/champion";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface ChampionListSidebarProps {
  tier: string;
  patch: string;
  platformId: string;
}

export default function ChampionListSidebar({
  tier,
  patch,
  platformId,
}: ChampionListSidebarProps) {
  const [search, setSearch] = useState("");
  const championData = useGameDataStore((s) => s.championData);

  const champions = useMemo(() => {
    if (!championData?.data) return [];
    const sorted = Object.values(championData.data).sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );
    if (!search.trim()) return sorted;
    const query = search.trim().toLowerCase();
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
    );
  }, [championData, search]);

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-3">
      {/* 검색 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="챔피언 검색..."
          className="w-full pl-9 pr-3 py-2 bg-surface-4 border border-divider rounded-lg text-sm text-on-surface placeholder:text-on-surface-medium focus:outline-none focus:border-primary"
        />
      </div>

      {/* 챔피언 목록 */}
      <div className="grid grid-cols-5 gap-1.5">
        {champions.map((champ) => (
          <Link
            prefetch={false}
            key={champ.id}
            href={`/champion-stats/${champ.id}?tier=${tier}&patch=${patch}&platformId=${platformId}`}
            className="flex flex-col items-center gap-1 p-1.5 rounded transition-colors text-on-surface-medium hover:bg-surface-4 hover:text-on-surface"
          >
            <Image
              src={getChampionImageUrl(champ.id)}
              alt={champ.name}
              width={40}
              height={40}
              className="rounded"
              unoptimized
            />
            <span className="w-full truncate text-center text-xs">
              {getChampionNameByEnglishName(champ.id)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
