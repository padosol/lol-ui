"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { esportsHomeHref, esportsTeamHref, type EsportsTeam } from "@/entities/esports";

interface PersonBreadcrumbProps {
  nickName: string;
  /** 지금 소속 팀. 없으면(FA·은퇴·이력 없음) e-sports › 이름 */
  team: EsportsTeam | null;
  leagueLabel: string | null;
}

export default function PersonBreadcrumb({ nickName, team, leagueLabel }: PersonBreadcrumbProps) {
  const t = useTranslations("esports.person");
  const tList = useTranslations("esports.list");

  const trail: { key: string; label: string; href: string }[] = [
    { key: "home", label: tList("eyebrow"), href: esportsHomeHref() },
  ];
  if (team && leagueLabel) {
    trail.push({ key: "league", label: leagueLabel, href: esportsHomeHref(team.homeLeagueId ?? undefined) });
  }
  if (team) {
    trail.push({ key: "team", label: team.name, href: esportsTeamHref(team.teamId) });
  }

  return (
    <nav aria-label={t("breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-medium">
        {trail.map((item) => (
          <Fragment key={item.key}>
            <li>
              <Link href={item.href} className="hover:text-on-surface">
                {item.label}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
          </Fragment>
        ))}
        <li aria-current="page" className="text-on-surface">
          {nickName}
        </li>
      </ol>
    </nav>
  );
}
