"use client";

import Tooltip from "@/components/tooltip/Tooltip";
import type { Match } from "@/types/api";
import { useMemo } from "react";

interface ContributionGraphProps {
  matches: Match[];
}

const DAY_LABELS = ["", "월", "", "수", "", "금", ""];
const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function getColorClass(count: number): string {
  if (count === 0) return "bg-surface-4";
  if (count === 1) return "bg-primary/25";
  if (count === 2) return "bg-primary/40";
  if (count <= 4) return "bg-primary/60";
  return "bg-primary/90";
}

export default function ContributionGraph({ matches }: ContributionGraphProps) {
  const { weeks, monthLabels } = useMemo(() => {
    if (matches.length === 0) return { weeks: [], monthLabels: [] };

    // 날짜별 게임 횟수 Map 생성
    const countByDate = new Map<string, number>();
    for (const match of matches) {
      if (!match.gameTimestamp) continue;
      const date = new Date(match.gameTimestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      countByDate.set(key, (countByDate.get(key) || 0) + 1);
    }

    // 가장 오래된 매치 날짜 ~ 오늘까지 범위 계산
    const timestamps = matches
      .map((m) => m.gameTimestamp)
      .filter((t) => t > 0);
    if (timestamps.length === 0) return { weeks: [], monthLabels: [] };

    const minTimestamp = Math.min(...timestamps);
    const startDate = new Date(minTimestamp);
    startDate.setHours(0, 0, 0, 0);
    // 해당 주의 일요일로 맞춤
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // 주 단위로 셀 생성
    const weeksArr: { date: Date; count: number; key: string }[][] = [];
    const monthLabelsArr: { label: string; weekIndex: number }[] = [];
    let currentDate = new Date(startDate);
    let lastMonth = -1;

    while (currentDate <= today) {
      const week: { date: Date; count: number; key: string }[] = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(currentDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const isFuture = d > today;
        week.push({
          date: d,
          count: isFuture ? -1 : (countByDate.get(key) || 0),
          key,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeksArr.push(week);

      // 월 라벨: 이 주의 첫 날이 새로운 달이면 표시
      const firstDayOfWeek = week[0].date;
      const month = firstDayOfWeek.getMonth();
      if (month !== lastMonth) {
        monthLabelsArr.push({
          label: MONTH_LABELS[month],
          weekIndex: weeksArr.length - 1,
        });
        lastMonth = month;
      }
    }

    return { weeks: weeksArr, monthLabels: monthLabelsArr };
  }, [matches]);

  if (weeks.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-0.5 min-w-fit">
        {/* 월 라벨 */}
        <div className="flex ml-7" style={{ gap: "2px" }}>
          {weeks.map((_, weekIdx) => {
            const monthLabel = monthLabels.find((m) => m.weekIndex === weekIdx);
            return (
              <div
                key={weekIdx}
                className="text-[9px] text-on-surface-medium leading-none"
                style={{ width: "10px", minWidth: "10px" }}
              >
                {monthLabel?.label || ""}
              </div>
            );
          })}
        </div>

        {/* 그리드: 요일 라벨 + 셀 */}
        <div className="flex gap-0">
          {/* 요일 라벨 */}
          <div className="flex flex-col pr-1" style={{ gap: "2px" }}>
            {DAY_LABELS.map((label, idx) => (
              <div
                key={idx}
                className="text-[9px] text-on-surface-medium leading-none flex items-center justify-end"
                style={{ height: "10px", width: "24px" }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 셀 그리드 */}
          <div className="flex" style={{ gap: "2px" }}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col" style={{ gap: "2px" }}>
                {week.map((cell) => {
                  if (cell.count === -1) {
                    // 미래 날짜: 빈 공간
                    return (
                      <div
                        key={cell.key}
                        style={{ width: "10px", height: "10px" }}
                      />
                    );
                  }

                  const dateStr = `${cell.date.getFullYear()}년 ${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일`;
                  const tooltipText = cell.count > 0
                    ? `${dateStr} — ${cell.count}게임`
                    : `${dateStr} — 게임 없음`;

                  return (
                    <Tooltip
                      key={cell.key}
                      content={
                        <div className="bg-surface-1 border border-divider shadow-xl rounded-lg px-2.5 py-1.5">
                          <span className="text-xs text-on-surface whitespace-nowrap">{tooltipText}</span>
                        </div>
                      }
                    >
                      <div
                        className={`rounded-sm ${getColorClass(cell.count)}`}
                        style={{ width: "10px", height: "10px" }}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[9px] text-on-surface-medium">적음</span>
          {[0, 1, 2, 3, 5].map((count) => (
            <div
              key={count}
              className={`rounded-sm ${getColorClass(count)}`}
              style={{ width: "10px", height: "10px" }}
            />
          ))}
          <span className="text-[9px] text-on-surface-medium">많음</span>
        </div>
      </div>
    </div>
  );
}
