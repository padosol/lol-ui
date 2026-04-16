"use client";

import Image from "next/image";
import { Mic, MicOff, Clock, Users } from "lucide-react";
import type { DuoPost } from "@/entities/duo";
import { LANE_LABELS, LANE_IMAGE_KEY, POST_STATUS_LABELS } from "@/entities/duo";
import { getPositionImageUrl } from "@/shared/lib/position";
import { getTierName } from "@/shared/lib/tier";
import { getRelativeTime } from "@/shared/lib/date";

const TIER_COLORS: Record<string, string> = {
  IRON: "text-gray-400",
  BRONZE: "text-amber-700",
  SILVER: "text-gray-300",
  GOLD: "text-yellow-400",
  PLATINUM: "text-teal-300",
  EMERALD: "text-emerald-400",
  DIAMOND: "text-blue-300",
  MASTER: "text-purple-400",
  GRANDMASTER: "text-red-400",
  CHALLENGER: "text-rank-top",
};

interface DuoCardProps {
  post: DuoPost;
  onSelect: (postId: number) => void;
}

export default function DuoCard({ post, onSelect }: DuoCardProps) {
  const tier = post.tier;
  const isMasterPlus = tier !== null && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const tierDisplay = tier !== null ? getTierName(tier) : "언랭크";
  const rankDisplay = tier === null || isMasterPlus ? "" : ` ${post.rank}`;
  const lpDisplay = tier !== null ? ` ${post.leaguePoints}LP` : "";
  const isActive = post.status === "ACTIVE";

  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      className="cursor-pointer bg-surface-1 border border-divider rounded-lg p-3 hover:border-primary/50 transition-colors w-full flex items-center gap-3"
    >
      {/* 라인 아이콘 */}
      <div className="flex items-center gap-1 shrink-0">
        <Image
          src={getPositionImageUrl(LANE_IMAGE_KEY[post.primaryLane])}
          alt={LANE_LABELS[post.primaryLane]}
          width={18}
          height={18}
        />
        <span className="text-on-surface-disabled text-xs">/</span>
        <Image
          src={getPositionImageUrl(LANE_IMAGE_KEY[post.desiredLane])}
          alt={LANE_LABELS[post.desiredLane]}
          width={16}
          height={16}
          className="opacity-70"
        />
      </div>

      {/* 티어 */}
      <span
        className={`text-sm font-medium shrink-0 w-28 truncate text-left ${tier !== null ? (TIER_COLORS[tier] ?? "text-on-surface") : "text-on-surface-disabled"}`}
      >
        {tierDisplay}{rankDisplay}{lpDisplay}
      </span>

      {/* 마이크 */}
      <span
        className={`shrink-0 ${post.hasMicrophone ? "text-green-400" : "text-on-surface-disabled"}`}
      >
        {post.hasMicrophone ? (
          <Mic className="w-3.5 h-3.5" />
        ) : (
          <MicOff className="w-3.5 h-3.5" />
        )}
      </span>

      {/* 상태 배지 */}
      {!isActive && (
        <span className="shrink-0 text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-disabled">
          {POST_STATUS_LABELS[post.status]}
        </span>
      )}

      {/* 메모 */}
      <p className="text-sm text-on-surface-medium truncate min-w-0 flex-1 text-left">
        {post.memo || "—"}
      </p>

      {/* 메타: 신청수 + 만료 + 시간 */}
      <div className="flex items-center gap-2 shrink-0 text-xs text-on-surface-disabled">
        {post.requestCount !== undefined && post.requestCount > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <Users className="w-3 h-3" />
            {post.requestCount}
          </span>
        )}
        <span className="inline-flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {getExpiryText(post.expiresAt)}
        </span>
        <span className="hidden sm:inline">{getRelativeTime(post.createdAt)}</span>
      </div>
    </button>
  );
}

function getExpiryText(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "만료됨";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}
