import { describe, expect, it } from "vitest";
import {
  globalContractEndDate,
  nextGlobalContractEndDate,
  parseLocalDate,
  todayInSeoul,
} from "./date";

describe("globalContractEndDate", () => {
  it("11월 세 번째 월요일이다", () => {
    expect(globalContractEndDate(2026)).toBe("2026-11-16"); // 11-01 이 일요일
    expect(globalContractEndDate(2027)).toBe("2027-11-15"); // 11-01 이 월요일
    expect(globalContractEndDate(2024)).toBe("2024-11-18"); // 11-01 이 금요일
    expect(globalContractEndDate(2025)).toBe("2025-11-17"); // 11-01 이 토요일
    expect(globalContractEndDate(2022)).toBe("2022-11-21"); // 11-01 이 화요일
  });
});

describe("nextGlobalContractEndDate", () => {
  it("올해 종료일 전이면 올해 종료일", () => {
    expect(nextGlobalContractEndDate("2026-06-01")).toBe("2026-11-16");
  });

  it("종료일 당일은 그날 — 계약은 그날까지 유효하다", () => {
    expect(nextGlobalContractEndDate("2026-11-16")).toBe("2026-11-16");
  });

  it("종료일이 지났으면 내년 종료일", () => {
    expect(nextGlobalContractEndDate("2026-11-17")).toBe("2027-11-15");
    expect(nextGlobalContractEndDate("2026-11-23")).toBe("2027-11-15");
    expect(nextGlobalContractEndDate("2026-12-31")).toBe("2027-11-15");
  });
});

describe("todayInSeoul", () => {
  it("서버의 오늘(Asia/Seoul) 날짜를 준다", () => {
    // UTC 11-22 15:30 = KST 11-23 00:30
    expect(todayInSeoul(new Date("2026-11-22T15:30:00Z"))).toBe("2026-11-23");
    expect(todayInSeoul(new Date("2026-11-22T14:59:59Z"))).toBe("2026-11-22");
  });
});

describe("parseLocalDate", () => {
  it("그 날짜의 UTC 자정으로 읽는다", () => {
    expect(parseLocalDate("2026-11-16").toISOString()).toBe("2026-11-16T00:00:00.000Z");
  });

  it("형식이 다르면 던진다", () => {
    expect(() => parseLocalDate("2026/11/16")).toThrow();
    expect(() => parseLocalDate("2026-13-01")).toThrow();
  });
});
