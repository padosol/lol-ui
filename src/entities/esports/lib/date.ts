import type { LocalDate } from "../types";

const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * "YYYY-MM-DD" → 그 날짜의 UTC 자정.
 *
 * 화면에 보일 때는 `format.dateTime(date, { dateStyle: "medium", timeZone: "UTC" })` 처럼 UTC 로 포맷한다.
 * 로컬 시간대로 포맷하면 UTC 보다 늦은 시간대에서 하루 앞 날짜로 보인다.
 */
export function parseLocalDate(value: LocalDate): Date {
  const match = LOCAL_DATE.exec(value);
  if (!match) throw new RangeError(`Invalid LocalDate: ${value}`);
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (date.getUTCMonth() !== Number(m) - 1 || date.getUTCDate() !== Number(d)) {
    throw new RangeError(`Invalid LocalDate: ${value}`);
  }
  return date;
}

/** 서버가 상태를 계산할 때 쓰는 "오늘"(DB 세션 시간대 Asia/Seoul)의 날짜. */
export function todayInSeoul(now: Date = new Date()): LocalDate {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 그 해 글로벌 공식 계약 종료일(GCD) — 11월 세 번째 월요일. 모든 계약은 이날 끝난다. */
export function globalContractEndDate(year: number): LocalDate {
  const firstDayOfWeek = new Date(Date.UTC(year, 10, 1)).getUTCDay(); // 0 = 일요일
  const firstMonday = 1 + ((8 - firstDayOfWeek) % 7);
  const thirdMonday = firstMonday + 14;
  return `${year}-11-${String(thirdMonday).padStart(2, "0")}`;
}

/**
 * 다음 계약 종료일. 스토브리그 "계약 만료 예정자" 의 기본 기준일이다.
 * 종료일 당일까지는 그해 종료일이다(계약은 그날까지 유효하다).
 */
export function nextGlobalContractEndDate(today: LocalDate): LocalDate {
  const year = Number(today.slice(0, 4));
  const thisYear = globalContractEndDate(year);
  return today <= thisYear ? thisYear : globalContractEndDate(year + 1);
}
