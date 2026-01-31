/**
 * 챔피언 통계(Overview 등)에서 공통으로 사용하는 표시/색상 규칙
 * - 승률 색상은 한 곳에서만 관리되도록 분리
 */

export const WIN_RATE_COLOR_CLASSES = {
  LT_40: "text-stat-neutral",
  LT_50: "text-stat-low",
  LT_60: "text-stat-mid",
  GTE_60: "text-stat-high",
} as const;

/**
 * 승률(%)에 따른 텍스트 컬러 클래스
 * - < 40: 회색
 * - < 50: 붉은색
 * - < 60: 파란색
 * - 그 외: 노란색
 */
export function getWinRateTextClass(winRatePercent: number): string {
  if (winRatePercent < 40) return WIN_RATE_COLOR_CLASSES.LT_40;
  if (winRatePercent < 50) return WIN_RATE_COLOR_CLASSES.LT_50;
  if (winRatePercent < 60) return WIN_RATE_COLOR_CLASSES.LT_60;
  return WIN_RATE_COLOR_CLASSES.GTE_60;
}

/**
 * 승률 계산 (소수점 2자리 올림)
 */
export function calcWinRateCeil2(wins: number, playCount: number): number {
  if (playCount === 0) return 0;
  const raw = (wins / playCount) * 100;
  return Math.ceil(raw * 100) / 100;
}


