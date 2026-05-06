export const TIER_OPTIONS = [
  { value: "CHALLENGER", label: "챌린저" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "GRANDMASTER+", label: "그랜드마스터+" },
  { value: "MASTER", label: "마스터" },
  { value: "MASTER+", label: "마스터+" },
  { value: "DIAMOND", label: "다이아몬드" },
  { value: "DIAMOND+", label: "다이아몬드+" },
  { value: "EMERALD", label: "에메랄드" },
  { value: "EMERALD+", label: "에메랄드+" },
  { value: "PLATINUM", label: "플래티넘" },
  { value: "PLATINUM+", label: "플래티넘+" },
  { value: "GOLD", label: "골드" },
  { value: "GOLD+", label: "골드+" },
  { value: "SILVER", label: "실버" },
  { value: "SILVER+", label: "실버+" },
  { value: "BRONZE", label: "브론즈" },
  { value: "BRONZE+", label: "브론즈+" },
  { value: "IRON", label: "아이언" },
  { value: "IRON+", label: "아이언+" },
] as const;

export type TierValue = (typeof TIER_OPTIONS)[number]["value"];

export function getTierLabel(value: string): string {
  return TIER_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getNextLowerTier(current: string): { value: string; label: string } | null {
  const idx = TIER_OPTIONS.findIndex((o) => o.value === current);
  if (idx < 0 || idx >= TIER_OPTIONS.length - 1) return null;
  const next = TIER_OPTIONS[idx + 1];
  return { value: next.value, label: next.label };
}
