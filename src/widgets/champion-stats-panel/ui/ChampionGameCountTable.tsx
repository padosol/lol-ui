"use client";

import type { PositionChampionEntry } from "@/entities/champion";
import { getChampionImageUrl } from "@/entities/champion";
import { useGameDataStore } from "@/shared/model/game-data";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ChampionGameCountTableProps {
  champions: PositionChampionEntry[];
  tier: string;
  patch: string;
  platformId: string;
}

export default function ChampionGameCountTable({
  champions,
  tier,
  patch,
  platformId,
}: ChampionGameCountTableProps) {
  const [search, setSearch] = useState("");
  const championData = useGameDataStore((s) => s.championData);

  // championId → { name, id(영문명) } 매핑
  const championMap = useMemo(() => {
    if (!championData?.data) return new Map<number, { name: string; id: string }>();
    const map = new Map<number, { name: string; id: string }>();
    for (const champ of Object.values(championData.data)) {
      map.set(Number(champ.key), { name: champ.name, id: champ.id });
    }
    return map;
  }, [championData]);

  // 게임수 내림차순 정렬 + 검색 필터
  const filtered = useMemo(() => {
    const sorted = [...champions].sort((a, b) => b.totalGames - a.totalGames);
    if (!search.trim()) return sorted;
    const query = search.trim().toLowerCase();
    return sorted.filter((c) => {
      const info = championMap.get(c.championId);
      if (!info) return false;
      return (
        info.name.toLowerCase().includes(query) ||
        info.id.toLowerCase().includes(query)
      );
    });
  }, [champions, search, championMap]);

  return (
    <div className="bg-surface-2 border border-divider rounded-xl overflow-hidden">
      {/* 검색 */}
      <div className="p-3 border-b border-divider">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="챔피언 검색..."
            className="w-full pl-9 pr-3 py-2 bg-surface-4 border border-divider rounded-lg text-sm text-on-surface placeholder:text-on-surface-medium focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[60px_1fr_120px] px-4 py-2 text-xs font-medium text-on-surface-medium border-b border-divider bg-surface-4">
        <span className="text-center">#</span>
        <span>챔피언</span>
        <span className="text-right">게임수</span>
      </div>

      {/* 테이블 바디 */}
      <div className="max-h-[600px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-on-surface-medium text-sm">
            {search ? "검색 결과가 없습니다." : "데이터가 없습니다."}
          </div>
        ) : (
          filtered.map((entry, index) => {
            const info = championMap.get(entry.championId);
            const championName = info?.name ?? `Champion ${entry.championId}`;
            const championId = info?.id ?? "";
            return (
              <Link
                key={entry.championId}
                href={`/champion-stats/${championId}?tier=${tier}&patch=${patch}&platformId=${platformId}`}
                className="grid grid-cols-[60px_1fr_120px] items-center px-4 py-2.5 hover:bg-surface-4 transition-colors border-b border-divider last:border-b-0"
              >
                <span className="text-center text-sm text-on-surface-medium">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  {championId && (
                    <Image
                      src={getChampionImageUrl(championId)}
                      alt={championName}
                      width={32}
                      height={32}
                      unoptimized
                      className="rounded"
                    />
                  )}
                  <span className="text-sm font-medium text-on-surface">
                    {championName}
                  </span>
                </div>
                <span className="text-right text-sm text-on-surface">
                  {entry.totalGames.toLocaleString()}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
