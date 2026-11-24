"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import {
  esportsPersonHref,
  splitStaff,
  type EsportsTeam,
  type RosterEntry,
  type TeamRoster,
} from "@/entities/esports";

interface RosterSwitcherProps {
  team: EsportsTeam;
  roster: TeamRoster;
  currentPersonId: string;
}

/** 같은 팀 로스터 전환 줄 — 감독 → 코치 | 포지션 순 선수. 팀 안에서 옆 사람으로 바로 넘어간다. */
export default function RosterSwitcher({ team, roster, currentPersonId }: RosterSwitcherProps) {
  const t = useTranslations("esports.person");
  const { headCoaches, coaches } = splitStaff(roster.staff);
  const staff = [...headCoaches, ...coaches];

  if (staff.length + roster.players.length < 2) return null;

  return (
    <nav
      aria-label={t("rosterNav", { team: team.name })}
      className="flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-lg border border-divider bg-surface-1 p-1"
    >
      {staff.map((entry) => (
        <RosterLink key={entry.personId} entry={entry} current={entry.personId === currentPersonId} />
      ))}
      {staff.length > 0 && roster.players.length > 0 && (
        <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-divider" />
      )}
      {roster.players.map((entry) => (
        <RosterLink key={entry.personId} entry={entry} current={entry.personId === currentPersonId} />
      ))}
    </nav>
  );
}

function RosterLink({ entry, current }: { entry: RosterEntry; current: boolean }) {
  const tRole = useTranslations("domain.esports.role");
  const tPosition = useTranslations("domain.esports.position");
  const label = entry.position ? tPosition(entry.position) : tRole(entry.role);

  return (
    <Link
      href={esportsPersonHref(entry.personId)}
      aria-current={current ? "page" : undefined}
      className={`flex shrink-0 flex-col rounded-md px-3 py-1.5 text-on-surface ${
        current ? "bg-surface-8" : "hover:bg-surface-4"
      }`}
    >
      <span className="text-[11px] leading-[14px] text-on-surface-medium">{label}</span>
      <span className={`text-[13px] leading-[18px] ${current ? "font-bold" : "font-semibold"}`}>{entry.nickName}</span>
    </Link>
  );
}
