"use client";

import { useGameDataStore } from "@/shared/model/game-data";
import { getChampionImageUrl, getChampionNameByEnglishName } from "@/entities/champion";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  const championData = useGameDataStore((s) => s.championData);
  const [search, setSearch] = useState("");

  const champions = useMemo(() => {
    if (!championData?.data) return [];
    return Object.values(championData.data).sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );
  }, [championData]);

  const filtered = useMemo(() => {
    return champions.filter((c) => {
      return (
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [champions, search]);

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-3">
      {/* 검색 */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium" />
        <input
          type="text"
          placeholder="챔피언 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-4 border border-divider rounded-lg text-on-surface placeholder:text-on-surface-medium focus:outline-none focus:border-primary"
        />
      </div>

      {/* 챔피언 목록 */}
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto grid grid-cols-3 gap-1.5">
        {filtered.map((champ) => (
          <Link
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
        {filtered.length === 0 && (
          <p className="text-center text-on-surface-medium text-sm py-4">
            검색 결과 없음
          </p>
        )}
      </div>
    </div>
  );
}
