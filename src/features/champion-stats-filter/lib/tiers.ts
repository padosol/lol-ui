/**
 * 티어 선택 옵션.
 *
 * 표시 문구는 여기 두지 않는다 — `domain.tier.*` 메시지에서 가져온다.
 * "GOLD+" 처럼 `+` 가 붙은 값은 base 만 번역하고 `+` 를 그대로 이어 붙인다.
 */
export const TIER_OPTIONS = [
  "CHALLENGER",
  "GRANDMASTER",
  "GRANDMASTER+",
  "MASTER",
  "MASTER+",
  "DIAMOND",
  "DIAMOND+",
  "EMERALD",
  "EMERALD+",
  "PLATINUM",
  "PLATINUM+",
  "GOLD",
  "GOLD+",
  "SILVER",
  "SILVER+",
  "BRONZE",
  "BRONZE+",
  "IRON",
  "IRON+",
] as const;

export type TierValue = (typeof TIER_OPTIONS)[number];

/** 번역 키가 존재하는 base 티어 */
export const TIER_BASES = [
  "CHALLENGER",
  "GRANDMASTER",
  "MASTER",
  "DIAMOND",
  "EMERALD",
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "IRON",
] as const;

export type TierBase = (typeof TIER_BASES)[number];

export function isTierBase(value: string): value is TierBase {
  return (TIER_BASES as readonly string[]).includes(value);
}

/** "GOLD+" → { base: "GOLD", plus: true } */
export function splitTier(value: string): { base: string; plus: boolean } {
  const plus = value.endsWith("+");
  return { base: plus ? value.slice(0, -1) : value, plus };
}

export function getNextLowerTier(current: string): TierValue | null {
  const idx = (TIER_OPTIONS as readonly string[]).indexOf(current);
  if (idx < 0 || idx >= TIER_OPTIONS.length - 1) return null;
  return TIER_OPTIONS[idx + 1];
}
