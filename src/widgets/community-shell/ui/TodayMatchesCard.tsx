"use client";

import { useTranslations } from "next-intl";

export interface TodayMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  /** 가운데 칸 문구 — 시작 전이면 "20:00", 진행 중이면 "1 : 0" 처럼 스코어 */
  label: string;
  /** 진행 중인 경기면 라이브 표시를 붙인다 */
  live?: boolean;
}

interface TodayMatchesCardProps {
  matches?: TodayMatch[];
}

/**
 * 커뮤니티 우측의 "오늘 경기" 카드.
 *
 * 경기 일정 API 가 아직 없어 기본값은 빈 배열이고 빈 상태만 그린다.
 * 데이터가 준비되면 호출부에서 matches 를 넘겨주면 그대로 목록이 채워진다.
 */
export default function TodayMatchesCard({ matches = [] }: TodayMatchesCardProps) {
  const t = useTranslations("community.aside");

  return (
    <section className="bg-surface-1 border border-divider rounded-xl overflow-hidden">
      <div className="flex items-center px-4 pt-4 pb-3">
        <h2 className="text-xs font-bold tracking-wider text-on-surface-disabled">
          {t("todayMatchesTitle")}
        </h2>
      </div>

      {matches.length === 0 ? (
        <div className="px-4 pb-5 text-xs text-on-surface-disabled">
          {t("todayMatchesEmpty")}
        </div>
      ) : (
        <ul className="flex flex-col">
          {matches.map((match) => (
            <li
              key={match.id}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-divider px-4 py-2.5"
            >
              <span className="truncate text-right text-[13.5px] text-on-surface">
                {match.homeTeam}
              </span>
              <span
                className={`whitespace-nowrap text-xs font-bold ${
                  match.live ? "text-primary" : "text-on-surface-disabled"
                }`}
              >
                {match.label}
              </span>
              <span className="truncate text-[13.5px] text-on-surface">
                {match.awayTeam}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
