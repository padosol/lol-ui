"use client";

import { useGameDataStore } from "@/stores/useGameDataStore";

const TAG_NAMES: Record<string, string> = {
  Fighter: "전사",
  Tank: "탱커",
  Mage: "마법사",
  Assassin: "암살자",
  Marksman: "원거리 딜러",
  Support: "서포터",
};

interface ChampionTooltipContentProps {
  championName: string; // 영문 이름 (id), e.g. "Annie"
}

export default function ChampionTooltipContent({ championName }: ChampionTooltipContentProps) {
  const championData = useGameDataStore((state) => state.championData);

  // championName(영문 id)으로 데이터 찾기
  let champion = null;
  if (championData?.data) {
    for (const key in championData.data) {
      if (championData.data[key].id === championName) {
        champion = championData.data[key];
        break;
      }
    }
  }

  if (!champion) {
    return (
      <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-3 max-w-[260px]">
        <div className="text-on-surface font-bold text-sm">{championName}</div>
      </div>
    );
  }

  const info = champion.info;
  const stats = champion.stats;
  const tags = champion.tags || [];

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-3 max-w-[260px]">
      {/* 이름 + 타이틀 */}
      <div className="mb-2">
        <span className="text-on-surface font-bold text-sm">{champion.name}</span>
        {champion.title && (
          <span className="text-on-surface-medium text-xs ml-1.5">- {champion.title}</span>
        )}
      </div>

      {/* 태그 */}
      {tags.length > 0 && (
        <div className="flex gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-6 text-on-surface-medium"
            >
              {TAG_NAMES[tag] || tag}
            </span>
          ))}
        </div>
      )}

      {/* Info 스탯 바 */}
      {info && (
        <div className="space-y-1 mb-2">
          {([
            ["공격", info.attack, "bg-stat-low"],
            ["방어", info.defense, "bg-success"],
            ["마법", info.magic, "bg-primary"],
            ["난이도", info.difficulty, "bg-warning"],
          ] as const).map(([label, value, color]) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px]">
              <span className="text-on-surface-medium w-8 shrink-0">{label}</span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-sm ${
                      i < value ? color : "bg-surface-6"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 기본 스탯 */}
      {stats && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] border-t border-divider/50 pt-1.5">
          <div className="flex justify-between">
            <span className="text-on-surface-medium">HP</span>
            <span className="text-on-surface">{stats.hp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">방어력</span>
            <span className="text-on-surface">{stats.armor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">마법저항</span>
            <span className="text-on-surface">{stats.spellblock}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">이동속도</span>
            <span className="text-on-surface">{stats.movespeed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">사거리</span>
            <span className="text-on-surface">{stats.attackrange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">공격력</span>
            <span className="text-on-surface">{stats.attackdamage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
