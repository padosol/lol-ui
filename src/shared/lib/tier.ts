import { IMAGE_HOST } from "@/shared/config/image";

export function getTierImageUrl(tier: string): string {
  if (!tier || tier === "UNRANKED") {
    return "";
  }
  const normalizedTier = tier.toUpperCase();
  return `${IMAGE_HOST}/tier/${normalizedTier}.png`;
}

export function getTierName(tier: string): string {
  const tierMap: Record<string, string> = {
    IRON: "아이언",
    BRONZE: "브론즈",
    SILVER: "실버",
    GOLD: "골드",
    PLATINUM: "플래티넘",
    EMERALD: "에메랄드",
    DIAMOND: "다이아몬드",
    MASTER: "마스터",
    GRANDMASTER: "그랜드마스터",
    CHALLENGER: "챌린저",
    UNRANKED: "언랭크",
  };
  return tierMap[tier.toUpperCase()] || tier;
}

export function getTierInitial(tier: string): string {
  const initials: Record<string, string> = {
    IRON: "I",
    BRONZE: "B",
    SILVER: "S",
    GOLD: "G",
    PLATINUM: "P",
    EMERALD: "E",
    DIAMOND: "D",
    MASTER: "M",
    GRANDMASTER: "GM",
    CHALLENGER: "C",
  };
  return initials[tier.toUpperCase()] || "?";
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    IRON: "from-gray-600 to-gray-800",
    BRONZE: "from-amber-700 to-amber-900",
    SILVER: "from-gray-400 to-gray-600",
    GOLD: "from-yellow-400 to-yellow-600",
    PLATINUM: "from-cyan-400 to-cyan-600",
    EMERALD: "from-emerald-400 to-emerald-600",
    DIAMOND: "from-blue-400 to-blue-600",
    MASTER: "from-purple-400 to-purple-600",
    GRANDMASTER: "from-red-400 to-red-600",
    CHALLENGER: "from-orange-400 to-orange-600",
  };
  return colors[tier.toUpperCase()] || "from-gray-400 to-gray-600";
}
