import type {
  CareerEvent,
  Contract,
  EsportsPosition,
  LocalDate,
  PersonCareer,
  Tenure,
} from "../types";

export type CareerRow =
  | { kind: "contract"; date: LocalDate; contract: Contract }
  | { kind: "event"; date: LocalDate; event: CareerEvent };

export type CareerItem =
  | {
      kind: "tenure";
      tenure: Tenure;
      /** 최신순 */
      rows: CareerRow[];
      /** 기간 안 가장 최근 계약의 포지션(스태프면 null) */
      position: EsportsPosition | null;
    }
  | { kind: "event"; event: CareerEvent };

/**
 * 커리어 타임라인 — 소속 기간마다 계약·사건을 묶고, 어느 기간에도 들지 않는 사건(소속이 끝난 뒤의 은퇴 등)은 따로 둔다.
 * 항목과 기간 안 행 모두 최신순이다. 항목의 기준일은 기간 시작일 또는 사건일이다.
 */
export function buildCareerTimeline(career: PersonCareer): CareerItem[] {
  const tenures = [...career.tenures].sort((a, b) => newestFirst(a.startDate, b.startDate));
  const rows = new Map<Tenure, CareerRow[]>(tenures.map((tenure) => [tenure, []]));

  for (const contract of career.contracts) {
    const owner = tenures.find(
      (tenure) => tenure.teamIds.includes(contract.teamId) && within(contract.startDate, tenure)
    );
    // 소속 기간은 서버가 계약으로 만든 것이라 모든 계약은 어느 기간엔가 든다.
    if (owner) rows.get(owner)?.push({ kind: "contract", date: contract.startDate, contract });
  }

  const loose: CareerEvent[] = [];
  for (const event of career.events) {
    const owner = tenures.find(
      (tenure) =>
        (event.teamId === null || tenure.teamIds.includes(event.teamId)) &&
        within(event.eventDate, tenure)
    );
    if (owner) {
      rows.get(owner)?.push({ kind: "event", date: event.eventDate, event });
    } else {
      loose.push(event);
    }
  }

  const items: CareerItem[] = [
    ...tenures.map((tenure): CareerItem => {
      const tenureRows = (rows.get(tenure) ?? []).sort((a, b) => newestFirst(a.date, b.date));
      const latestContract = tenureRows.find((row) => row.kind === "contract");
      return {
        kind: "tenure",
        tenure,
        rows: tenureRows,
        position: latestContract?.kind === "contract" ? latestContract.contract.position : null,
      };
    }),
    ...loose.map((event): CareerItem => ({ kind: "event", event })),
  ];
  return items.sort((a, b) => newestFirst(anchorDate(a), anchorDate(b)));
}

/**
 * 소속 기간을 화면에 보일 끝. 서버의 lastDay 는 마지막 계약의 만료일이라 진행 중이면 미래 날짜다 —
 * 진행 중(끝이 없거나 오늘 이후)이면 "현재"로 쓰고 기간 길이는 오늘까지 센다.
 */
export function tenurePeriod(
  tenure: Pick<Tenure, "lastDay">,
  today: LocalDate
): { ongoing: boolean; end: LocalDate } {
  const ongoing = tenure.lastDay === null || tenure.lastDay >= today;
  return { ongoing, end: ongoing ? today : (tenure.lastDay as LocalDate) };
}

function within(date: LocalDate, tenure: Tenure): boolean {
  return date >= tenure.startDate && (tenure.lastDay === null || date <= tenure.lastDay);
}

function anchorDate(item: CareerItem): LocalDate {
  return item.kind === "tenure" ? item.tenure.startDate : item.event.eventDate;
}

function newestFirst(a: LocalDate, b: LocalDate): number {
  return a < b ? 1 : a > b ? -1 : 0;
}
