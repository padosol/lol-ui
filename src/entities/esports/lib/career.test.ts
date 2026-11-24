import { describe, expect, it } from "vitest";
import type {
  CareerEvent,
  CareerEventType,
  Contract,
  ContractType,
  EsportsPosition,
  EsportsRole,
  PersonCareer,
  Tenure,
} from "../types";
import { buildCareerTimeline, tenurePeriod } from "./career";

function tenure(teamId: string, startDate: string, lastDay: string | null, asPlayer = true): Tenure {
  return {
    personId: "p",
    nickName: "p",
    organizationId: teamId,
    asPlayer,
    startDate,
    lastDay,
    endReason: lastDay ? "EXPIRED" : null,
    contractCount: 1,
    renewalCount: 0,
    loan: false,
    roles: [asPlayer ? "PLAYER" : "HEAD_COACH"],
    teamIds: [teamId],
  };
}

let nextId = 1;

function contract(
  teamId: string,
  startDate: string,
  endDate: string | null,
  opts: { type?: ContractType; role?: EsportsRole; position?: EsportsPosition | null } = {}
): Contract {
  return {
    contractId: nextId++,
    teamId,
    teamCode: teamId.toUpperCase(),
    role: opts.role ?? "PLAYER",
    position: opts.position === undefined ? "MID" : opts.position,
    contractType: opts.type ?? "SIGN",
    startDate,
    endDate,
    actualEndDate: null,
    lastDay: endDate,
    status: "ENDED",
    endReason: null,
    note: null,
  };
}

function event(eventType: CareerEventType, eventDate: string, teamId: string | null = null): CareerEvent {
  return {
    eventId: nextId++,
    eventType,
    eventDate,
    teamId,
    reason: eventType === "HIATUS" ? "MILITARY" : null,
    note: null,
    sourceUrl: null,
  };
}

function career(parts: Omit<PersonCareer, "personId">): PersonCareer {
  return { personId: "p", ...parts };
}

describe("buildCareerTimeline", () => {
  it("소속 기간 사이의 사건은 따로 한 줄이 되고, 기준일 내림차순으로 놓인다 (Lumen: 선수 → 은퇴 → 감독)", () => {
    const bravo = tenure("bravo", "2022-11-22", "2024-11-18");
    const charlie = tenure("charlie", "2025-11-18", null, false);
    const asPlayer = contract("bravo", "2022-11-22", "2024-11-18");
    const asCoach = contract("charlie", "2025-11-18", "2027-11-15", { role: "HEAD_COACH", position: null });
    const retire = event("RETIRE", "2024-11-19");

    const items = buildCareerTimeline(
      career({ tenures: [bravo, charlie], contracts: [asPlayer, asCoach], events: [retire] })
    );

    expect(items).toEqual([
      { kind: "tenure", tenure: charlie, position: null, rows: [{ kind: "contract", date: "2025-11-18", contract: asCoach }] },
      { kind: "event", event: retire },
      { kind: "tenure", tenure: bravo, position: "MID", rows: [{ kind: "contract", date: "2022-11-22", contract: asPlayer }] },
    ]);
  });

  it("한 기간의 계약을 최신순으로 묶고, 가장 최근 계약의 포지션을 기간 포지션으로 쓴다 (Arcturus)", () => {
    const alpha = tenure("alpha", "2023-11-21", null);
    const sign = contract("alpha", "2023-11-21", "2024-11-18");
    const renewal1 = contract("alpha", "2024-11-19", "2026-11-16", { type: "RENEWAL" });
    const renewal2 = contract("alpha", "2026-11-17", "2028-11-20", { type: "RENEWAL" });

    const [item] = buildCareerTimeline(
      career({ tenures: [alpha], contracts: [sign, renewal1, renewal2], events: [] })
    );

    expect(item).toMatchObject({ kind: "tenure", position: "MID" });
    expect(item.kind === "tenure" && item.rows.map((row) => row.date)).toEqual([
      "2026-11-17",
      "2024-11-19",
      "2023-11-21",
    ]);
  });

  it("팀이 없는 사건이 기간 안에 있으면 그 기간의 행으로 들어간다 (Kite: 계약 중 군 입대)", () => {
    const charlie = tenure("charlie", "2025-11-18", null);
    const sign = contract("charlie", "2025-11-18", "2027-11-15", { position: "AD" });
    const hiatus = event("HIATUS", "2026-10-01");

    const [item] = buildCareerTimeline(
      career({ tenures: [charlie], contracts: [sign], events: [hiatus] })
    );

    expect(item.kind === "tenure" && item.rows).toEqual([
      { kind: "event", date: "2026-10-01", event: hiatus },
      { kind: "contract", date: "2025-11-18", contract: sign },
    ]);
  });

  it("다른 팀의 사건은 기간 안 날짜여도 그 기간에 넣지 않는다", () => {
    const charlie = tenure("charlie", "2025-11-18", null);
    const elsewhere = event("RETURN", "2026-01-10", "bravo");

    const items = buildCareerTimeline(career({ tenures: [charlie], contracts: [], events: [elsewhere] }));

    expect(items).toEqual([
      { kind: "event", event: elsewhere },
      { kind: "tenure", tenure: charlie, position: null, rows: [] },
    ]);
  });

  it("이력이 없으면 빈 배열이다", () => {
    expect(buildCareerTimeline(career({ tenures: [], contracts: [], events: [] }))).toEqual([]);
  });
});

describe("tenurePeriod", () => {
  const today = "2026-11-25";

  it("마지막 계약이 아직 유효하면 진행 중이고, 기간은 오늘까지다", () => {
    // 서버의 소속 기간 last_day 는 마지막 계약의 만료일이라 진행 중이면 미래 날짜다.
    expect(tenurePeriod(tenure("alpha", "2023-11-21", "2028-11-20"), today)).toEqual({
      ongoing: true,
      end: today,
    });
  });

  it("끝 날짜가 없어도 진행 중이다", () => {
    expect(tenurePeriod(tenure("alpha", "2023-11-21", null), today)).toEqual({ ongoing: true, end: today });
  });

  it("이미 끝난 기간은 그 끝 날짜까지다", () => {
    expect(tenurePeriod(tenure("bravo", "2022-11-22", "2024-11-18"), today)).toEqual({
      ongoing: false,
      end: "2024-11-18",
    });
  });
});
