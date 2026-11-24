"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import {
  PersonPhoto,
  PersonStatusBadge,
  TeamLogo,
  esportsTeamHref,
  formatDotDate,
  fullYearsBetween,
  statusDetails,
  type EsportsTeam,
  type LocalDate,
  type PersonProfile,
  type PersonStatusInfo,
} from "@/entities/esports";

interface PersonHeaderProps {
  profile: PersonProfile;
  teamsById: Map<string, EsportsTeam>;
  today: LocalDate;
}

/** 인물 머리 카드 — 사진·활동명·실명·국적·생년월일, 그리고 현재 상태(이력이 없으면 숨김). */
export default function PersonHeader({ profile, teamsById, today }: PersonHeaderProps) {
  const t = useTranslations("esports.person");
  const locale = useLocale();
  const country = profile.nationality ? countryName(profile.nationality, locale) : null;
  const birth = profile.birthDate
    ? `${formatDotDate(profile.birthDate)} (${t("age", { age: fullYearsBetween(profile.birthDate, today) })})`
    : null;
  const meta = [country, birth].filter(Boolean).join(" · ");

  return (
    <header className="flex flex-wrap items-stretch gap-6 rounded-lg border border-divider bg-surface-1 p-4 sm:p-6">
      <div className="flex min-w-0 flex-[999_1_360px] items-start gap-4">
        <PersonPhoto imageUrl={profile.imageUrl} name={profile.nickName} className="size-16 sm:size-20" />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="break-words text-lg font-bold text-on-surface sm:text-xl">{profile.nickName}</h1>
          {profile.realName && (
            <p className="text-sm font-medium text-on-surface">
              {profile.realName}
              {profile.realNameEng && <span className="text-on-surface-medium"> · {profile.realNameEng}</span>}
            </p>
          )}
          {meta && <p className="text-xs text-on-surface-medium">{meta}</p>}
        </div>
      </div>
      {profile.status && <StatusPanel status={profile.status} teamsById={teamsById} />}
    </header>
  );
}

function StatusPanel({ status, teamsById }: { status: PersonStatusInfo; teamsById: Map<string, EsportsTeam> }) {
  const t = useTranslations("esports.person");
  const tRole = useTranslations("domain.esports.role");
  const tPosition = useTranslations("domain.esports.position");
  const tHiatus = useTranslations("domain.esports.hiatusReason");

  const team = status.teamId ? teamsById.get(status.teamId) : undefined;
  const roleLine = [
    status.role ? tRole(status.role) : null,
    status.position ? tPosition(status.position) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const dateOrDash = (date: string | null) => (date ? formatDotDate(date) : "—");
  const rows: { key: string; label: string; value: ReactNode }[] = statusDetails(status).map((detail) => {
    switch (detail.kind) {
      case "contractEnds":
        return {
          key: detail.kind,
          label: t("contractEnds"),
          value: detail.date ? formatDotDate(detail.date) : t("expiresUnknown"),
        };
      case "inactive":
        return {
          key: detail.kind,
          label: t("inactiveReason"),
          value: detail.reason ? tHiatus(detail.reason) : "—",
        };
      case "nextContract":
        return {
          key: detail.kind,
          label: t("nextContract"),
          value: t("nextContractValue", { team: teamName(teamsById, detail.teamId), date: dateOrDash(detail.date) }),
        };
      case "rights":
        return {
          key: detail.kind,
          label: t("rights"),
          value: t("rightsValue", { team: teamName(teamsById, detail.teamId), date: dateOrDash(detail.date) }),
        };
    }
  });

  return (
    <section
      aria-label={t("status")}
      className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5 rounded-lg bg-surface-2 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium text-on-surface-medium">{t("status")}</h2>
        <PersonStatusBadge status={status.status} />
      </div>
      {status.teamId ? (
        <div className="flex items-center gap-2.5">
          <TeamLogo team={team} size="sm" className="size-8" />
          <div className="min-w-0">
            <Link
              href={esportsTeamHref(status.teamId)}
              className="block text-base font-bold text-on-surface hover:text-primary"
            >
              {team?.name ?? status.teamId}
            </Link>
            {(roleLine || status.retiredAsPlayer) && (
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-medium">
                {roleLine}
                {status.retiredAsPlayer && status.role !== "PLAYER" && (
                  <span className="rounded-full bg-surface-8 px-1.5 text-[11px] font-medium">
                    {t("retiredAsPlayer")}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      ) : (
        status.status === "FREE_AGENT" && <p className="text-sm text-on-surface-medium">{t("noTeam")}</p>
      )}
      {rows.length > 0 && (
        <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
          {rows.map((row) => (
            <div key={row.key} className="contents">
              <dt className="text-on-surface-medium">{row.label}</dt>
              <dd className="font-semibold text-on-surface">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function teamName(teamsById: Map<string, EsportsTeam>, teamId: string): string {
  return teamsById.get(teamId)?.name ?? teamId;
}

/** ISO alpha-2 → 표시 언어의 나라 이름. 모르는 코드는 코드 그대로. */
function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
