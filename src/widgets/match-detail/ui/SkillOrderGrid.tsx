import { GameTooltip } from "@/shared/ui/tooltip";
import { useGameDataStore } from "@/shared/model/game-data";
import type { SkillSeqEntry } from "@/entities/match";
import Image from "next/image";
import { useState } from "react";

const SKILL_KEYS = ["Q", "W", "E", "R"] as const;
const SKILL_COLORS: Record<string, { bg: string; text: string; master: string }> = {
  Q: { bg: "bg-stat-mid/20 text-stat-mid", text: "text-stat-mid", master: "bg-stat-mid/40 ring-1 ring-stat-mid/50 text-stat-mid" },
  W: { bg: "bg-secondary/20 text-secondary", text: "text-secondary", master: "bg-secondary/40 ring-1 ring-secondary/50 text-secondary" },
  E: { bg: "bg-primary/20 text-primary", text: "text-primary", master: "bg-primary/40 ring-1 ring-primary/50 text-primary" },
  R: { bg: "bg-gold/20 text-gold", text: "text-gold", master: "bg-gold/40 ring-1 ring-gold/50 text-gold" },
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
                <SkillLabel skillKey={skillKey} skillIndex={skillIdx} championName={championName} />

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
                        <span className="text-[9px] font-bold">
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

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://static.mmrtr.shop';

function SkillLabel({ skillKey, skillIndex, championName }: { skillKey: string; skillIndex: number; championName?: string }) {
  const [imgError, setImgError] = useState(false);
  const championData = useGameDataStore((state) => state.championData);

  const spell = championData?.data?.[championName ?? '']?.spells?.[skillIndex];
  const spellImageUrl = spell?.image?.full
    ? `${IMAGE_HOST}/spells/${spell.image.full}`
    : null;

  const label = championName && spellImageUrl && !imgError ? (
    <div className="py-0.5 flex items-center justify-center">
      <Image
        src={spellImageUrl}
        alt={skillKey}
        width={20}
        height={20}
        className="rounded"
        unoptimized
        onError={() => setImgError(true)}
      />
    </div>
  ) : (
    <div
      className={`text-[10px] font-bold py-0.5 flex items-center justify-center ${SKILL_COLORS[skillKey].text}`}
    >
      {skillKey}
    </div>
  );

  return (
    <GameTooltip type="championSpell" id={`${championName}:${skillIndex}`} disabled={!championName}>
      {label}
    </GameTooltip>
  );
}
