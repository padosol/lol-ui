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
      className="bg-surface-1 border border-divider rounded-lg p-4 hover:border-primary/50 transition-colors text-left w-full"
    >
      {/* 상단: 라인 + 티어 + 시간 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Image
            src={getPositionImageUrl(LANE_IMAGE_KEY[post.primaryLane])}
            alt={LANE_LABELS[post.primaryLane]}
            width={20}
            height={20}
          />
          <span className="text-sm font-medium text-on-surface">
            {LANE_LABELS[post.primaryLane]}
          </span>
          <span className="text-on-surface-disabled">/</span>
          <Image
            src={getPositionImageUrl(LANE_IMAGE_KEY[post.secondaryLane])}
            alt={LANE_LABELS[post.secondaryLane]}
            width={16}
            height={16}
            className="opacity-70"
          />
          <span className="text-xs text-on-surface-medium">
            {LANE_LABELS[post.secondaryLane]}
          </span>
        </div>
        <span className="text-xs text-on-surface-disabled">
          {getRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* 중간: 티어 + 상태 + 마이크 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`text-sm font-medium ${tier !== null ? (TIER_COLORS[tier] ?? "text-on-surface") : "text-on-surface-disabled"}`}
        >
          {tierDisplay}
          {rankDisplay}{lpDisplay}
        </span>

        {!isActive && (
          <span className="text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-disabled">
            {POST_STATUS_LABELS[post.status]}
          </span>
        )}

        <span
          className={`inline-flex items-center gap-1 text-xs ${post.hasMicrophone ? "text-green-400" : "text-on-surface-disabled"}`}
        >
          {post.hasMicrophone ? (
            <Mic className="w-3 h-3" />
          ) : (
            <MicOff className="w-3 h-3" />
          )}
          {post.hasMicrophone ? "마이크" : "마이크 없음"}
        </span>
      </div>

      {/* 메모 */}
      {post.memo && (
        <p className="text-sm text-on-surface-medium leading-relaxed mb-3 line-clamp-2">
          {post.memo}
        </p>
      )}

      {/* 하단: 요청 수 */}
      <div className="flex items-center gap-3 text-xs text-on-surface-disabled">
        {post.requestCount !== undefined && post.requestCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Users className="w-3 h-3" />
            신청 {post.requestCount}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getExpiryText(post.expiresAt)}
        </span>
      </div>
    </button>
  );
}

function getExpiryText(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "만료됨";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  return `${minutes}분 남음`;
}
