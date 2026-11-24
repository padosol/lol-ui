import type { LocalDate } from "../types";
import { parseLocalDate } from "./date";

/** "2024-11-19" → "2024.11.19". e스포츠 화면의 날짜는 로케일과 상관없이 이 숫자 형식을 쓴다. */
export function formatDotDate(date: LocalDate): string {
  const [y, m, d] = parts(date);
  return `${y}.${pad(m)}.${pad(d)}`;
}

/** "2024-11-19" → "2024.11" */
export function formatDotYearMonth(date: LocalDate): string {
  const [y, m] = parts(date);
  return `${y}.${pad(m)}`;
}

/** 꽉 찬 햇수. 나이(만 나이)와 "N년차" 계산에 쓴다. */
export function fullYearsBetween(from: LocalDate, to: LocalDate): number {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  const years = ty - fy - (tm < fm || (tm === fm && td < fd) ? 1 : 0);
  return Math.max(0, years);
}

/** 꽉 찬 개월 수를 햇수·개월로 나눈다. 소속 기간 길이("1년 3개월")에 쓴다. */
export function durationParts(from: LocalDate, to: LocalDate): { years: number; months: number } {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  const total = Math.max(0, (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0));
  return { years: Math.floor(total / 12), months: total % 12 };
}

function parts(date: LocalDate): [number, number, number] {
  const value = parseLocalDate(date);
  return [value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
