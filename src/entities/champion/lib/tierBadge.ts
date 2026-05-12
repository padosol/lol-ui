// 챔피언 티어 배지 컬러 — 상위 티어는 골드/녹색 톤, 하위는 회색/블루.
// 패배(loss) 색은 빨강이므로 배지에서는 빨강을 쓰지 않는다.
const TIER_BADGE_COLORS: Record<string, string> = {
  "S+": "bg-gold text-surface",
  S: "bg-amber-400 text-surface",
  A: "bg-emerald-500 text-white",
  B: "bg-teal-500 text-white",
  C: "bg-blue-500 text-white",
  D: "bg-gray-500 text-white",
};

export function getTierBadgeClass(tier: string): string {
  return TIER_BADGE_COLORS[tier] ?? TIER_BADGE_COLORS["D"];
}
