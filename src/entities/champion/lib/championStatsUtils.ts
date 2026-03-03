export const WIN_RATE_COLOR_CLASSES = {
  LT_40: "text-stat-neutral",
  LT_50: "text-stat-low",
  LT_60: "text-stat-mid",
  GTE_60: "text-stat-high",
} as const;

export function getWinRateTextClass(winRatePercent: number): string {
  if (winRatePercent < 40) return WIN_RATE_COLOR_CLASSES.LT_40;
  if (winRatePercent < 50) return WIN_RATE_COLOR_CLASSES.LT_50;
  if (winRatePercent < 60) return WIN_RATE_COLOR_CLASSES.LT_60;
  return WIN_RATE_COLOR_CLASSES.GTE_60;
}

export function calcWinRateCeil2(wins: number, playCount: number): number {
  if (playCount === 0) return 0;
  const raw = (wins / playCount) * 100;
  return Math.ceil(raw * 100) / 100;
}
