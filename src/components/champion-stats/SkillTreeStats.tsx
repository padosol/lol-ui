"use client";

import GameTooltip from "@/components/tooltip/GameTooltip";
import type { SkillBuildData } from "@/types/championStats";
import { getChampionSpellImageUrl } from "@/utils/game";
import Image from "next/image";
import { useState } from "react";

const SKILL_KEYS = ["Q", "W", "E", "R"] as const;
const SKILL_COLORS: Record<
  string,
  { bg: string; text: string; master: string }
> = {
  Q: {
    bg: "bg-stat-mid text-white",
    text: "text-stat-mid",
    master: "bg-stat-mid ring-1 ring-white/30 text-white",
  },
  W: {
    bg: "bg-secondary text-white",
    text: "text-secondary",
    master: "bg-secondary ring-1 ring-white/30 text-white",
  },
  E: {
    bg: "bg-primary text-white",
    text: "text-primary",
    master: "bg-primary ring-1 ring-white/30 text-white",
  },
  R: {
    bg: "bg-gold text-surface",
    text: "text-gold",
    master: "bg-gold ring-1 ring-white/30 text-surface",
  },
};
const SKILL_MAX_LEVELS = [5, 5, 5, 3];

interface SkillTreeStatsProps {
  data: SkillBuildData[];
  championName: string;
}

/**
 * skillOrder15 문자열에서 각 스킬(Q/W/E)이 5회 도달하는 순서를 계산하여 마스터 순서 도출
 */
function computeMasterOrder(skillOrder15: string): string[] {
  const skills = skillOrder15.split(",");
  const counts: Record<string, number> = { Q: 0, W: 0, E: 0 };
  const masterOrder: string[] = [];

  for (const skill of skills) {
    if (skill === "R") continue;
    if (counts[skill] !== undefined) {
      counts[skill]++;
      if (counts[skill] === 5 && !masterOrder.includes(skill)) {
        masterOrder.push(skill);
      }
    }
  }

  // 5회에 못 미친 스킬도 추가
  for (const s of ["Q", "W", "E"]) {
    if (!masterOrder.includes(s)) masterOrder.push(s);
  }

  return masterOrder;
}

/**
 * skillOrder15 문자열을 slot 번호 배열로 변환 (Q=1, W=2, E=3, R=4)
 */
function toSlotSequence(skillOrder15: string): number[] {
  const map: Record<string, number> = { Q: 1, W: 2, E: 3, R: 4 };
  return skillOrder15.split(",").map((s) => map[s] || 0);
}

export default function SkillTreeStats({
  data,
  championName,
}: SkillTreeStatsProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">스킬 트리</h3>

      {/* 스킬 마스터 순서 */}
      <div className="mb-5">
        <h4 className="text-sm font-medium text-on-surface-medium mb-2">
          스킬 마스터 순서
        </h4>
        <div className="space-y-2">
          {data.map((build, i) => {
            const masterOrder = computeMasterOrder(build.skillOrder15);
            return (
              <div
                key={i}
                className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-1">
                  {masterOrder.map((skill, j) => (
                    <div key={j} className="flex items-center">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded ${
                          SKILL_COLORS[skill]?.bg || ""
                        }`}
                      >
                        {skill}
                      </span>
                      {j < masterOrder.length - 1 && (
                        <span className="mx-1 text-on-surface-medium text-xs">
                          &gt;
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 ml-auto text-xs">
                  <span>
                    <span className="text-on-surface-medium">승률 </span>
                    <span
                      className={`font-medium ${
                        build.totalWinRate >= 50 ? "text-win" : "text-loss"
                      }`}
                    >
                      {build.totalWinRate.toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-on-surface-medium">
                    {build.totalGames.toLocaleString()}게임
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 레벨별 스킬 순서 */}
      <div>
        <h4 className="text-sm font-medium text-on-surface-medium mb-2">
          레벨별 스킬 순서
        </h4>
        <div className="space-y-3">
          {data.map((build, i) => {
            const sequence = toSlotSequence(build.skillOrder15);
            return (
              <div key={i} className="bg-surface rounded-lg p-3">
                <div className="flex items-center gap-4 mb-2 text-xs">
                  <span>
                    <span className="text-on-surface-medium">승률 </span>
                    <span
                      className={`font-medium ${
                        build.totalWinRate >= 50 ? "text-win" : "text-loss"
                      }`}
                    >
                      {build.totalWinRate.toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-on-surface-medium">
                    {build.totalGames.toLocaleString()}게임
                  </span>
                </div>
                <SkillGrid
                  sequence={sequence}
                  championName={championName}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkillGrid({
  sequence,
  championName,
}: {
  sequence: number[];
  championName: string;
}) {
  const maxLevel = Math.min(sequence.length, 18);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[360px]">
        <div className="grid grid-cols-[24px_repeat(18,1fr)] gap-px text-center">
          {/* 헤더 */}
          <div className="text-[9px] text-on-surface-medium" />
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="text-[9px] text-on-surface-medium py-0.5">
              {i + 1}
            </div>
          ))}

          {/* Q/W/E/R 행 */}
          {SKILL_KEYS.map((skillKey, skillIdx) => (
            <div key={skillKey} className="contents">
              <SkillLabel
                skillKey={skillKey}
                skillIndex={skillIdx}
                championName={championName}
              />
              {Array.from({ length: 18 }, (_, levelIdx) => {
                const isSkillUp =
                  levelIdx < maxLevel &&
                  sequence[levelIdx] === skillIdx + 1;
                let count = 0;
                for (let l = 0; l <= levelIdx && l < maxLevel; l++) {
                  if (sequence[l] === skillIdx + 1) count++;
                }
                const isMaster =
                  isSkillUp && count === SKILL_MAX_LEVELS[skillIdx];
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
                    {isSkillUp && (
                      <span
                        className={`text-[9px] font-bold ${
                          isMaster ? "text-white" : ""
                        }`}
                      >
                        {isMaster ? "M" : count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillLabel({
  skillKey,
  skillIndex,
  championName,
}: {
  skillKey: string;
  skillIndex: number;
  championName: string;
}) {
  const [imgError, setImgError] = useState(false);

  const label =
    championName && !imgError ? (
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
    ) : (
      <div
        className={`text-[10px] font-bold py-0.5 flex items-center justify-center ${SKILL_COLORS[skillKey].text}`}
      >
        {skillKey}
      </div>
    );

  return (
    <GameTooltip
      type="championSpell"
      id={`${championName}:${skillIndex}`}
      disabled={!championName}
    >
      {label}
    </GameTooltip>
  );
}
