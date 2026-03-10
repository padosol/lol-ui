"use client";

import { useState } from "react";
import Image from "next/image";
import type { SkillBuildData } from "@/entities/champion";
import { useGameDataStore } from "@/shared/model/game-data";
import { IMAGE_HOST } from "@/shared/config/image";

const SLOT_TO_SKILL: Record<string, string> = {
  "1": "Q", "2": "W", "3": "E", "4": "R",
  Q: "Q", W: "W", E: "E", R: "R",
};

const SKILL_COLORS: Record<string, string> = {
  Q: "bg-stat-mid text-white",
  W: "bg-secondary text-white",
  E: "bg-primary text-white",
  R: "bg-gold text-surface",
};

function normalizeSkills(skillBuild: string): string[] {
  return skillBuild.split(",").map((s) => SLOT_TO_SKILL[s] ?? s);
}

interface SkillTreeStatsProps {
  data: SkillBuildData[];
  championName: string;
}

function computeMasterOrder(skillBuild: string): string[] {
  const skills = normalizeSkills(skillBuild);
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

  for (const s of ["Q", "W", "E"]) {
    if (!masterOrder.includes(s)) masterOrder.push(s);
  }

  return masterOrder;
}

export default function SkillTreeStats({
  data,
  championName,
}: SkillTreeStatsProps) {
  const championData = useGameDataStore((s) => s.championData);
  const champion = championData?.data[championName];
  if (data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">스킬 트리</h3>

      <div className="space-y-2">
        {data.map((build, i) => {
          const masterOrder = computeMasterOrder(build.skillBuild);
          const sequence = normalizeSkills(build.skillBuild);
          const winRatePercent = build.winRate * 100;

          return (
            <div key={i} className="bg-surface rounded-lg p-3">
              {/* 마스터 순서 + 승률/게임수 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {masterOrder.map((skill, j) => (
                    <div key={j} className="flex items-center">
                      <SkillIcon
                        champion={champion}
                        championName={championName}
                        skillKey={skill}
                      />
                      {j < masterOrder.length - 1 && (
                        <span className="mx-1 text-on-surface-medium text-xs">
                          &gt;
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span>
                    <span className="text-on-surface-medium">승률 </span>
                    <span
                      className={`font-medium ${winRatePercent >= 50 ? "text-win" : "text-loss"}`}
                    >
                      {winRatePercent.toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-on-surface-medium">
                    {build.games.toLocaleString()}게임
                  </span>
                </div>
              </div>

              {/* 스킬 시퀀스 */}
              <div className="flex flex-wrap gap-0.5">
                {sequence.map((skill, idx) => (
                  <span
                    key={idx}
                    className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold ${SKILL_COLORS[skill] ?? "bg-surface-4 text-on-surface-medium"}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SKILL_KEY_TO_INDEX: Record<string, number> = { Q: 0, W: 1, E: 2, R: 3 };

function SkillIcon({
  champion,
  championName,
  skillKey,
}: {
  champion: { spells?: { image: { full: string }; name: string }[] } | undefined;
  championName: string;
  skillKey: string;
}) {
  const [imgError, setImgError] = useState(false);
  const index = SKILL_KEY_TO_INDEX[skillKey];
  const spell = champion?.spells?.[index];

  if (imgError) {
    return (
      <span
        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${SKILL_COLORS[skillKey] ?? "bg-surface-4 text-on-surface-medium"}`}
      >
        {skillKey}
      </span>
    );
  }

  const src = spell?.image.full
    ? `${IMAGE_HOST}/spells/${spell.image.full}`
    : `${IMAGE_HOST}/spells/${championName}${skillKey}.png`;

  return (
    <Image
      src={src}
      alt={spell?.name ?? `${championName} ${skillKey}`}
      width={24}
      height={24}
      className="rounded"
      unoptimized
      onError={() => setImgError(true)}
    />
  );
}
