"use client";

import Image from "next/image";
import { Mic, MicOff } from "lucide-react";
import type { DuoRequest } from "@/entities/duo";
import {
  LANE_LABELS,
  LANE_IMAGE_KEY,
  REQUEST_STATUS_LABELS,
} from "@/entities/duo";
import { getPositionImageUrl } from "@/shared/lib/position";
import { getTierName } from "@/shared/lib/tier";
import { getRelativeTime } from "@/shared/lib/date";
import { RequesterActionButtons } from "@/features/duo-matching";

interface DuoRequestCardProps {
  request: DuoRequest;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  ACCEPTED: "text-green-400",
  CONFIRMED: "text-primary",
  REJECTED: "text-red-400",
  CANCELLED: "text-on-surface-disabled",
};

export default function DuoRequestCard({ request }: DuoRequestCardProps) {
  const tier = request.tier;
  const isMasterPlus = tier !== null && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);

  return (
    <div className="bg-surface-1 border border-divider rounded-lg p-4 space-y-3">
      {/* 상단: 라인 + 상태 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={getPositionImageUrl(LANE_IMAGE_KEY[request.primaryLane])}
            alt={LANE_LABELS[request.primaryLane]}
            width={18}
            height={18}
          />
          <span className="text-sm font-medium text-on-surface">
            {LANE_LABELS[request.primaryLane]} /{" "}
            {LANE_LABELS[request.secondaryLane]}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 text-xs ${request.hasMicrophone ? "text-green-400" : "text-on-surface-disabled"}`}
          >
            {request.hasMicrophone ? (
              <Mic className="w-3 h-3" />
            ) : (
              <MicOff className="w-3 h-3" />
            )}
          </span>
        </div>
        <span
          className={`text-xs font-medium ${STATUS_COLORS[request.status] ?? "text-on-surface-disabled"}`}
        >
          {REQUEST_STATUS_LABELS[request.status]}
        </span>
      </div>

      {/* 티어 */}
      <p className="text-xs text-on-surface-medium">
        {tier !== null ? (
          <>{getTierName(tier)} {isMasterPlus ? "" : request.rank}{" "}{request.leaguePoints}LP</>
        ) : (
          <span className="text-on-surface-disabled">언랭크</span>
        )}
      </p>

      {/* 메모 */}
      {request.memo && (
        <p className="text-sm text-on-surface-medium">{request.memo}</p>
      )}

      {/* 시간 */}
      <p className="text-xs text-on-surface-disabled">
        {getRelativeTime(request.createdAt)}
      </p>

      {/* 액션 버튼 */}
      <RequesterActionButtons
        requestId={request.id}
        status={request.status}
      />
    </div>
  );
}
