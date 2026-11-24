"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import {
  TeamLogo,
  esportsHomeHref,
  esportsTeamHref,
  formatDotDate,
  type EsportsTeam,
} from "@/entities/esports";

export interface OrganizationTeamLink {
  team: EsportsTeam;
  leagueLabel: string | null;
}

interface TeamHeroProps {
  team: EsportsTeam;
  leagueLabel: string | null;
  seasonYear: number | null;
  /** 같은 조직의 다른 팀(LCK ↔ LCK CL) */
  organizationTeams: OrganizationTeamLink[];
  disbanded: boolean;
}

/** 팀 상세 머리 — 리그·시즌(리스트로 돌아가기), 큰 팀명, 창단 연도(·해체일)·같은 조직 팀, 로고. */
export default function TeamHero({ team, leagueLabel, seasonYear, organizationTeams, disbanded }: TeamHeroProps) {
  const t = useTranslations("esports.team");
  const tList = useTranslations("esports.list");

  const eyebrow =
    leagueLabel && seasonYear
      ? t("seasonEyebrow", { league: leagueLabel, year: String(seasonYear) })
      : (leagueLabel ?? tList("eyebrow"));

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-primary pb-4">
      <div className="min-w-0">
        <Link
          href={esportsHomeHref(team.homeLeagueId ?? undefined)}
          className="text-xs font-bold tracking-[0.16em] text-on-surface-medium hover:text-on-surface"
        >
          {eyebrow}
        </Link>
        <h1 className="mt-1 break-words text-[clamp(44px,8vw,104px)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-on-surface">
          {team.name}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5 text-right text-xs text-on-surface-medium">
          {team.foundedAt && <span>{t("founded", { year: team.foundedAt.slice(0, 4) })}</span>}
          {disbanded && team.disbandedAt && (
            <span className="font-semibold text-on-surface">
              {t("disbanded", { date: formatDotDate(team.disbandedAt) })}
            </span>
          )}
          {organizationTeams.map(({ team: other, leagueLabel: otherLeague }) => (
            <Link key={other.teamId} href={esportsTeamHref(other.teamId)} className="hover:text-on-surface">
              {otherLeague ? `${otherLeague} · ${other.name}` : other.name}
            </Link>
          ))}
        </div>
        <TeamLogo team={team} size="xl" />
      </div>
    </header>
  );
}
