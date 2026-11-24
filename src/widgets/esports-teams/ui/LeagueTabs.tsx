"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { esportsHomeHref, leagueLabel, type EsportsLeague } from "@/entities/esports";

interface LeagueTabsProps {
  leagues: EsportsLeague[];
  activeLeagueId: string | null;
}

/** 리그 전환(LCK / LCK CL). 첫 리그는 쿼리 없는 /esports 로 보내 주소가 하나로 모이게 한다. */
export default function LeagueTabs({ leagues, activeLeagueId }: LeagueTabsProps) {
  const t = useTranslations("esports.list");
  if (leagues.length < 2) return null;

  return (
    <nav aria-label={t("leagues")} className="inline-flex gap-1 rounded-lg bg-surface-2 p-1">
      {leagues.map((league, index) => {
        const active = league.leagueId === activeLeagueId;
        return (
          <Link
            key={league.leagueId}
            href={esportsHomeHref(index === 0 ? undefined : league.leagueId)}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-surface-8 text-on-surface" : "text-on-surface-medium hover:text-on-surface"
            }`}
          >
            {leagueLabel(league)}
          </Link>
        );
      })}
    </nav>
  );
}
