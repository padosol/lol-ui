"use client";

import { Fragment, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { esportsPersonHref, esportsTeamHref, type RosterEntry } from "@/entities/esports";
import type { OrganizationTeamLink } from "./TeamHero";

interface BenchBarProps {
  headCoaches: RosterEntry[];
  coaches: RosterEntry[];
  /** 주전에 들지 않은 선수 */
  subs: RosterEntry[];
  organizationTeams: OrganizationTeamLink[];
}

/** 벤치 — 감독 → 코치, 후보 선수, 같은 조직 팀(LCK CL 등) 로스터 링크. */
export default function BenchBar({ headCoaches, coaches, subs, organizationTeams }: BenchBarProps) {
  const t = useTranslations("esports.team");
  const tRole = useTranslations("domain.esports.role");
  const tPosition = useTranslations("domain.esports.position");
  const staff = [...headCoaches, ...coaches];

  // 오른쪽 끝 한 줄: "후보 A (미드), B (정글) · LCK CL 로스터 보기"
  const extras: ReactNode[] = [];
  if (subs.length > 0) {
    extras.push(
      <span key="subs">
        {t("subs")}{" "}
        {subs.map((sub, index) => (
          <Fragment key={sub.personId}>
            {index > 0 && ", "}
            <Link href={esportsPersonHref(sub.personId)} className="text-on-surface hover:text-primary">
              {sub.nickName}
            </Link>
            {sub.position && ` (${tPosition(sub.position)})`}
          </Fragment>
        ))}
      </span>
    );
  }
  for (const { team, leagueLabel } of organizationTeams) {
    extras.push(
      <Link key={team.teamId} href={esportsTeamHref(team.teamId)} className="text-primary hover:underline">
        {t("viewOrgRoster", { league: leagueLabel ?? team.name })}
      </Link>
    );
  }

  if (staff.length === 0 && extras.length === 0) return null;

  return (
    <section
      aria-label={t("benchGroup")}
      className="flex flex-wrap items-center gap-x-10 gap-y-3 rounded-xl border border-divider bg-surface-1 px-5 py-[18px]"
    >
      <span className="text-xs font-bold tracking-[0.16em] text-primary">{t("bench")}</span>
      {staff.map((person) => (
        <Link
          key={person.personId}
          href={esportsPersonHref(person.personId)}
          className="inline-flex items-baseline gap-2 text-on-surface hover:text-primary"
        >
          <span className="text-[11px] font-bold tracking-[0.12em] text-on-surface-medium">
            {tRole(person.role)}
          </span>
          <span className="text-lg font-extrabold uppercase leading-6">{person.nickName}</span>
        </Link>
      ))}
      {extras.length > 0 && (
        <span className="ml-auto text-xs text-on-surface-medium">
          {extras.map((node, index) => (
            <Fragment key={index}>
              {index > 0 && " · "}
              {node}
            </Fragment>
          ))}
        </span>
      )}
    </section>
  );
}
