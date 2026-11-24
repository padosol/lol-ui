"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import {
  TeamLogo,
  buildCareerTimeline,
  durationParts,
  esportsTeamHref,
  formatDotDate,
  type CareerEvent,
  type CareerEventType,
  type CareerRow,
  type Contract,
  type EsportsTeam,
  type LocalDate,
  type PersonCareer,
  type Tenure,
  type EsportsPosition,
} from "@/entities/esports";

interface CareerTimelineProps {
  career: PersonCareer;
  teamsById: Map<string, EsportsTeam>;
  today: LocalDate;
}

/**
 * 행 배치. 넓은 화면: 날짜 | 유형 | 내용 | 상태 네 칸.
 * 폰: 1줄 "날짜·유형 | 상태", 2줄 "내용" — 날짜·유형 묶음은 넓은 화면에서 contents 로 풀려 각자 칸에 들어간다.
 */
const ROW =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-divider px-4 py-2.5 sm:grid-cols-[84px_84px_minmax(0,1fr)_auto]";
const ROW_LEAD = "flex items-center gap-2 sm:contents";
const ROW_BODY = "col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto";
const ROW_TAIL = "col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto";

const EVENT_TONE: Record<CareerEventType, string> = {
  HIATUS: "bg-warning/15 text-warning",
  RETURN: "bg-success/15 text-success",
  UNRETIRE: "bg-success/15 text-success",
  RETIRE: "bg-surface-8 text-on-surface-medium",
};

/** 커리어 — 소속 기간 카드(계약·사건 최신순)와, 어느 기간에도 들지 않는 사건 한 줄. */
export default function CareerTimeline({ career, teamsById, today }: CareerTimelineProps) {
  const t = useTranslations("esports.person");
  const items = buildCareerTimeline(career);

  return (
    <section aria-labelledby="career-title" className="flex flex-col gap-3">
      <h2 id="career-title" className="text-lg font-bold text-on-surface">
        {t("career")}
      </h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-divider bg-surface-1 px-4 py-12 text-center">
          <p className="text-sm font-medium text-on-surface">{t("careerEmpty")}</p>
          <p className="text-xs text-on-surface-medium">{t("careerEmptyHint")}</p>
        </div>
      ) : (
        items.map((item) =>
          item.kind === "tenure" ? (
            <TenureCard
              key={`t-${item.tenure.organizationId}-${item.tenure.startDate}`}
              tenure={item.tenure}
              rows={item.rows}
              position={item.position}
              teamsById={teamsById}
              today={today}
            />
          ) : (
            <ol
              key={`e-${item.event.eventId}`}
              className="overflow-hidden rounded-lg border border-divider bg-surface-1 [&>li]:border-t-0"
            >
              <EventRow event={item.event} />
            </ol>
          )
        )
      )}
    </section>
  );
}

function TenureCard({
  tenure,
  rows,
  position,
  teamsById,
  today,
}: {
  tenure: Tenure;
  rows: CareerRow[];
  position: EsportsPosition | null;
  teamsById: Map<string, EsportsTeam>;
  today: LocalDate;
}) {
  const t = useTranslations("esports.person");
  const tRole = useTranslations("domain.esports.role");
  const tPosition = useTranslations("domain.esports.position");
  const team = teamsById.get(tenure.organizationId);
  const name = team?.name ?? tenure.organizationId;

  const sub = [
    tenure.roles.map((role) => tRole(role)).join(" · "),
    position ? tPosition(position) : null,
    tenure.renewalCount > 0 ? t("renewals", { count: tenure.renewalCount }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      aria-label={t("tenure", { team: name })}
      className="overflow-hidden rounded-lg border border-divider bg-surface-1"
    >
      <header className="flex items-center gap-3 px-4 py-3.5">
        <TeamLogo team={team} size="md" />
        <div className="min-w-0 flex-1">
          <Link
            href={esportsTeamHref(tenure.organizationId)}
            className="block text-base font-bold text-on-surface hover:text-primary"
          >
            {name}
          </Link>
          {sub && <p className="text-xs text-on-surface-medium">{sub}</p>}
        </div>
        <div className="shrink-0 text-right tabular-nums">
          <p className="text-sm font-medium text-on-surface">
            {formatDotDate(tenure.startDate)} – {tenure.lastDay ? formatDotDate(tenure.lastDay) : t("present")}
          </p>
          <p className="text-xs text-on-surface-medium">
            <Duration from={tenure.startDate} to={tenure.lastDay ?? today} />
          </p>
        </div>
      </header>
      {rows.length > 0 && (
        <ol>
          {rows.map((row) =>
            row.kind === "contract" ? (
              <ContractRow key={`c-${row.contract.contractId}`} contract={row.contract} teamsById={teamsById} />
            ) : (
              <EventRow key={`e-${row.event.eventId}`} event={row.event} />
            )
          )}
        </ol>
      )}
    </article>
  );
}

function ContractRow({ contract, teamsById }: { contract: Contract; teamsById: Map<string, EsportsTeam> }) {
  const t = useTranslations("esports.person");
  const tType = useTranslations("domain.esports.contractType");
  const tStatus = useTranslations("domain.esports.contractStatus");
  const tEnd = useTranslations("domain.esports.endReason");
  const tRole = useTranslations("domain.esports.role");
  const tPosition = useTranslations("domain.esports.position");

  const teamLabel = teamsById.get(contract.teamId)?.name ?? contract.teamCode;
  const what = contract.position ? tPosition(contract.position) : tRole(contract.role);
  const expiry = !contract.endDate
    ? t("expiresUnknown")
    : contract.actualEndDate && contract.actualEndDate !== contract.endDate
      ? t("expiresEarly", { date: formatDotDate(contract.endDate), actual: formatDotDate(contract.actualEndDate) })
      : t("expires", { date: formatDotDate(contract.endDate) });

  return (
    <li className={`${ROW} tabular-nums`}>
      <span className={ROW_LEAD}>
        <span className="text-sm font-medium text-on-surface">{formatDotDate(contract.startDate)}</span>
        <span>
          <span className="inline-block rounded-md bg-surface-4 px-2 py-0.5 text-xs font-medium text-on-surface">
            {tType(contract.contractType)}
          </span>
        </span>
      </span>
      <span className={ROW_BODY}>
        <span className="block truncate text-sm text-on-surface">
          {teamLabel} · {what}
        </span>
        <span className="block text-xs text-on-surface-medium">{expiry}</span>
      </span>
      {contract.status === "ACTIVE" ? (
        <span
          className={`${ROW_TAIL} inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-on-surface`}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
          {tStatus("ACTIVE")}
        </span>
      ) : (
        <span
          className={`${ROW_TAIL} whitespace-nowrap text-xs font-medium ${
            contract.status === "UPCOMING" ? "text-primary" : "text-on-surface-medium"
          }`}
        >
          {contract.status === "ENDED" && contract.endReason
            ? `${tStatus("ENDED")} · ${tEnd(contract.endReason)}`
            : tStatus(contract.status)}
        </span>
      )}
    </li>
  );
}

function EventRow({ event }: { event: CareerEvent }) {
  const tEvent = useTranslations("domain.esports.careerEventType");
  const tHiatus = useTranslations("domain.esports.hiatusReason");
  const detail = [event.reason ? tHiatus(event.reason) : null, event.note].filter(Boolean).join(" · ");

  return (
    <li className={`${ROW} tabular-nums`}>
      <span className={ROW_LEAD}>
        <span className="text-sm font-medium text-on-surface">{formatDotDate(event.eventDate)}</span>
        <span>
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${EVENT_TONE[event.eventType]}`}>
            {tEvent(event.eventType)}
          </span>
        </span>
      </span>
      {detail && <span className={`${ROW_BODY} truncate text-sm text-on-surface`}>{detail}</span>}
    </li>
  );
}

function Duration({ from, to }: { from: LocalDate; to: LocalDate }) {
  const t = useTranslations("esports.person");
  const { years, months } = durationParts(from, to);
  if (years > 0 && months > 0) return <>{t("durationYearsMonths", { years, months })}</>;
  if (years > 0) return <>{t("durationYears", { years })}</>;
  if (months > 0) return <>{t("durationMonths", { months })}</>;
  return <>{t("durationUnderMonth")}</>;
}
