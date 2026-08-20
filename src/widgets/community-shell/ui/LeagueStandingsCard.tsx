"use client";

import { useTranslations } from "next-intl";

export interface LeagueStanding {
  id: string;
  rank: number;
  team: string;
  /** "12승 3패" 처럼 이미 조합된 전적 문구 */
  record: string;
}

interface LeagueStandingsCardProps {
  standings?: LeagueStanding[];
}

/**
 * 커뮤니티 우측의 "리그 순위" 카드.
 *
 * 순위 API 가 아직 없어 기본값은 빈 배열이고 빈 상태만 그린다.
 * 데이터가 준비되면 호출부에서 standings 를 넘겨주면 그대로 목록이 채워진다.
 */
export default function LeagueStandingsCard({
  standings = [],
}: LeagueStandingsCardProps) {
  const t = useTranslations("community.aside");

  return (
    <section className="bg-surface-1 border border-divider rounded-xl p-4">
      <h2 className="text-xs font-bold tracking-wider text-on-surface-disabled mb-3">
        {t("standingsTitle")}
      </h2>

      {standings.length === 0 ? (
        <div className="text-xs text-on-surface-disabled">{t("standingsEmpty")}</div>
      ) : (
        <ol className="flex flex-col gap-0.5">
          {standings.map((standing) => (
            <li key={standing.id} className="flex items-center gap-2.5 py-1">
              <span
                className={`w-4 shrink-0 text-[12.5px] font-bold ${
                  standing.rank <= 3 ? "text-primary" : "text-on-surface-disabled"
                }`}
              >
                {standing.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-on-surface">
                {standing.team}
              </span>
              <span className="whitespace-nowrap text-[12.5px] font-semibold text-on-surface-medium">
                {standing.record}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
