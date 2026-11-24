import { describe, expect, it } from "vitest";
import { durationParts, formatDotDate, formatDotYearMonth, fullYearsBetween } from "./format";

describe("formatDotDate / formatDotYearMonth", () => {
  it("LocalDate 를 점으로 끊어 보여준다", () => {
    expect(formatDotDate("2024-11-19")).toBe("2024.11.19");
    expect(formatDotYearMonth("2024-11-19")).toBe("2024.11");
  });
});

describe("fullYearsBetween", () => {
  it("올해 기념일이 지났으면 햇수를 그대로 센다", () => {
    expect(fullYearsBetween("2003-04-12", "2026-11-25")).toBe(23);
  });

  it("올해 기념일이 아직이면 한 해를 뺀다", () => {
    expect(fullYearsBetween("2004-12-01", "2026-11-25")).toBe(21);
  });

  it("기념일 당일에는 한 해를 채운다", () => {
    expect(fullYearsBetween("2004-11-25", "2026-11-25")).toBe(22);
  });

  it("시작일보다 이른 날에는 0 이다", () => {
    expect(fullYearsBetween("2026-12-01", "2026-11-25")).toBe(0);
  });
});

describe("durationParts", () => {
  it("꽉 찬 햇수와 남은 개월 수로 나눈다", () => {
    expect(durationParts("2023-11-21", "2026-11-25")).toEqual({ years: 3, months: 0 });
    expect(durationParts("2024-11-19", "2026-02-28")).toEqual({ years: 1, months: 3 });
    expect(durationParts("2026-03-01", "2026-11-24")).toEqual({ years: 0, months: 8 });
  });

  it("한 달이 안 되면 0년 0개월이다", () => {
    expect(durationParts("2026-11-20", "2026-11-25")).toEqual({ years: 0, months: 0 });
  });

  it("시작일의 날짜를 지나야 한 달을 채운다(말일 시작 포함)", () => {
    expect(durationParts("2026-01-31", "2026-02-27")).toEqual({ years: 0, months: 0 });
    expect(durationParts("2026-01-31", "2026-03-01")).toEqual({ years: 0, months: 1 });
  });
});
