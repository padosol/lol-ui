import type { SkillSeqEntry } from "@/types/api";

const SKILL_KEYS = ["Q", "W", "E", "R"] as const;
const SKILL_COLORS: Record<string, string> = {
  Q: "bg-team-blue text-white",
  W: "bg-success text-white",
  E: "bg-warning text-white",
  R: "bg-loss text-white",
};
const SKILL_NUMBERS = [1, 2, 3, 4] as const;

export default function SkillOrderGrid({ skillSeq }: { skillSeq: SkillSeqEntry[] | null }) {
  if (!skillSeq || skillSeq.length === 0) {
    return (
      <div className="text-on-surface-medium text-[11px]">
        스킬 순서 정보 없음
      </div>
    );
  }

  const maxLevel = Math.min(skillSeq.length, 18);

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
          {SKILL_KEYS.map((skillKey, skillIdx) => (
            <div key={skillKey} className="contents">
              <div
                className={`text-[10px] font-bold py-0.5 flex items-center justify-center ${SKILL_COLORS[skillKey].replace("bg-", "text-").replace(" text-white", "")
                  }`}
              >
                {skillKey}
              </div>
              {Array.from({ length: 18 }, (_, levelIdx) => {
                const isSkillUp =
                  levelIdx < maxLevel &&
                  skillSeq[levelIdx].skillSlot === SKILL_NUMBERS[skillIdx];
                return (
                  <div
                    key={levelIdx}
                    className={`h-5 rounded-sm flex items-center justify-center ${isSkillUp
                        ? SKILL_COLORS[skillKey]
                        : "bg-surface-4/30"
                      }`}
                  >
                    {isSkillUp && (
                      <span className="text-[9px] font-bold">
                        {skillKey}
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
