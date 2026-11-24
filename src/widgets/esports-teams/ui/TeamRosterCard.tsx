"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import {
  ESPORTS_POSITIONS,
  TeamLogo,
  esportsTeamHref,
  splitStaff,
  startingLineup,
  type EsportsTeam,
  type TeamRoster,
} from "@/entities/esports";

interface TeamRosterCardProps {
  team: EsportsTeam;
  /** null = 로스터를 불러오지 못했다(카드는 그대로 두고 안내만 한다) */
  roster: TeamRoster | null;
}

/** 팀 리스트 카드 — 로고·이름 / 감독·코치진 / 주전 다섯 명. 카드 전체가 팀 상세 링크다. */
export default function TeamRosterCard({ team, roster }: TeamRosterCardProps) {
  const t = useTranslations("esports.list");
  const tRole = useTranslations("domain.esports.role");
  const tPosition = useTranslations("domain.esports.position");

  const staff = roster ? splitStaff(roster.staff) : null;
  const bench = staff ? [...staff.headCoaches, ...staff.coaches] : [];
  const lineup = roster ? startingLineup(roster.players) : null;

  return (
    <li className="flex">
      <Link
        href={esportsTeamHref(team.teamId)}
        className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-divider bg-surface-1 p-5 text-on-surface transition-colors hover:bg-surface-4"
      >
        <div className="flex items-center gap-3.5">
          <TeamLogo team={team} size="lg" />
          <h2 className="min-w-0 break-words text-xl font-black uppercase leading-[22px] tracking-tight">
            {team.name}
          </h2>
        </div>

        {lineup ? (
          <>
            {bench.length > 0 && (
              <div
                role="group"
                aria-label={t("staffGroup")}
                className="flex flex-wrap gap-x-3.5 gap-y-0.5 rounded-lg bg-surface-2 px-2.5 py-2"
              >
                {bench.map((person) => (
                  <span key={person.personId} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-[11px] font-bold tracking-[0.08em] text-on-surface-medium">
                      {tRole(person.role)}
                    </span>
                    <span className="text-sm font-extrabold uppercase">{person.nickName}</span>
                  </span>
                ))}
              </div>
            )}
            <div role="group" aria-label={t("startersGroup", { team: team.name })}>
              {ESPORTS_POSITIONS.map((position) => (
                <div key={position} className="flex items-baseline gap-3 border-t border-divider py-1.5">
                  <span className="w-12 shrink-0 text-[11px] font-bold tracking-[0.08em] text-on-surface-medium">
                    {tPosition(position)}
                  </span>
                  <span className="min-w-0 truncate text-[15px] font-extrabold uppercase leading-5">
                    {lineup.starters[position]?.nickName ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-on-surface-medium">{t("rosterUnavailable")}</p>
        )}

        <div className="mt-auto flex items-center justify-between text-xs font-bold tracking-[0.08em] text-primary">
          <span>{t("viewLineup")}</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </div>
      </Link>
    </li>
  );
}
