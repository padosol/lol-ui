import type { SkillSeqEntry } from "@/types/api";
import { getChampionSpellImageUrl } from "@/utils/game";
import Image from "next/image";
import { useState } from "react";

const SKILL_KEYS = ["Q", "W", "E", "R"] as const;
const SKILL_COLORS: Record<string, { bg: string; text: string; master: string }> = {
  Q: { bg: "bg-stat-mid text-white", text: "text-stat-mid", master: "bg-stat-mid ring-1 ring-white/30 text-white" },
  W: { bg: "bg-secondary text-white", text: "text-secondary", master: "bg-secondary ring-1 ring-white/30 text-white" },
  E: { bg: "bg-primary text-white", text: "text-primary", master: "bg-primary ring-1 ring-white/30 text-white" },
  R: { bg: "bg-gold text-surface", text: "text-gold", master: "bg-gold ring-1 ring-white/30 text-surface" },
};
const SKILL_NUMBERS = [1, 2, 3, 4] as const;
const SKILL_MAX_LEVELS = [5, 5, 5, 3] as const; // Q, W, E, R

interface SkillOrderGridProps {
  skillSeq: SkillSeqEntry[] | null;
  championName?: string;
}

export default function SkillOrderGrid({ skillSeq, championName }: SkillOrderGridProps) {
  if (!skillSeq || skillSeq.length === 0) {
    return (
      <div className="text-on-surface-medium text-[11px]">
        스킬 순서 정보 없음
      </div>
    );
  }

  const maxLevel = Math.min(skillSeq.length, 18);

  // 각 스킬별 누적 카운트 계산
  const skillCounts = [0, 0, 0, 0];
  const levelData = skillSeq.map((entry) => {
    const idx = entry.skillSlot - 1;
    skillCounts[idx]++;
    return { skillSlot: entry.skillSlot, count: skillCounts[idx] };
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[360px]">
        <div className="grid grid-cols-[24px_repeat(18,1fr)] gap-px text-center">
          {/* 헤더 행: 레벨 번호 */}
          <div className="text-[9px] text-on-surface-medium" />
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={i}
              className="text-[9px] text-on-surface-medium py-0.5"
            >
              {i + 1}
            </div>
          ))}

          {/* Q/W/E/R 각 행 */}
          {SKILL_KEYS.map((skillKey, skillIdx) => {
            return (
            <div key={skillKey} className="contents">
              <SkillLabel skillKey={skillKey} championName={championName} />

              {Array.from({ length: 18 }, (_, levelIdx) => {
                const isSkillUp =
                  levelIdx < maxLevel &&
                  skillSeq[levelIdx].skillSlot === SKILL_NUMBERS[skillIdx];
                const data = levelIdx < maxLevel ? levelData[levelIdx] : null;
                const isMaster = isSkillUp && data && data.count === SKILL_MAX_LEVELS[skillIdx];
                const cellClass = isSkillUp
                  ? isMaster
                    ? SKILL_COLORS[skillKey].master
                    : SKILL_COLORS[skillKey].bg
                  : "bg-surface-4/30";
                return (
                  <div
                    key={levelIdx}
                    className={`h-5 rounded-sm flex items-center justify-center ${cellClass}`}
                  >
                    {isSkillUp && data && (
                      <span className={`text-[9px] font-bold ${isMaster ? "text-white" : ""}`}>
                        {isMaster ? "M" : data.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkillLabel({ skillKey, championName }: { skillKey: string; championName?: string }) {
  const [imgError, setImgError] = useState(false);

  if (championName && !imgError) {
    return (
      <div className="py-0.5 flex items-center justify-center">
        <Image
          src={getChampionSpellImageUrl(championName, skillKey)}
          alt={skillKey}
          width={20}
          height={20}
          className="rounded"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`text-[10px] font-bold py-0.5 flex items-center justify-center ${SKILL_COLORS[skillKey].text}`}
    >
      {skillKey}
    </div>
  );
}
