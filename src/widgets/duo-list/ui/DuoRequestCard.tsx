"use client";

import Image from "next/image";
import { Mic, MicOff } from "lucide-react";
import type { DuoRequest } from "@/entities/duo";
import { LANE_IMAGE_KEY, useDuoMatchResult } from "@/entities/duo";
import { getPositionImageUrl } from "@/shared/lib/position";
import { getTierName } from "@/shared/lib/tier";
import { useFormatter, useTranslations } from "next-intl";
import { RequesterActionButtons } from "@/features/duo-matching";
import PartnerName from "./PartnerName";

interface DuoRequestCardProps {
  request: DuoRequest;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  ACCEPTED: "text-green-400",
  CONFIRMED: "text-primary",
  REJECTED: "text-red-400",
  CANCELLED: "text-on-surface-disabled",
  CLOSED: "text-on-surface-disabled",
};

export default function DuoRequestCard({ request }: DuoRequestCardProps) {
  const format = useFormatter();
  const t = useTranslations("duo");
  const tLane = useTranslations("domain.position");
  const tStatus = useTranslations("domain.duoRequestStatus");
  const tier = request.tier;
  const isMasterPlus = tier !== null && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);

  const isConfirmed = request.status === "CONFIRMED";
  const matchResult = useDuoMatchResult(request.duoPostId, isConfirmed);
  const partner = matchResult.data;

  return (
    <div className="bg-surface-1 border border-divider rounded-lg p-3">
      <div className="flex items-center gap-3">
      {/* 라인 아이콘 */}
      <div className="flex items-center gap-1 shrink-0">
        <Image
          src={getPositionImageUrl(LANE_IMAGE_KEY[request.primaryLane])}
          alt={tLane(request.primaryLane)}
          width={18}
          height={18}
        />
        <span className="text-on-surface-disabled text-xs">/</span>
        <Image
          src={getPositionImageUrl(LANE_IMAGE_KEY[request.desiredLane])}
          alt={tLane(request.desiredLane)}
          width={16}
          height={16}
          className="opacity-70"
        />
      </div>

      {/* 티어 */}
      <span className="text-xs text-on-surface-medium shrink-0 w-28 truncate">
        {tier !== null ? (
          <>{getTierName(tier)} {isMasterPlus ? "" : request.rank} {request.leaguePoints}LP</>
        ) : (
          <span className="text-on-surface-disabled">{t("unranked")}</span>
        )}
      </span>

      {/* 마이크 */}
      <span
        className={`shrink-0 ${request.hasMicrophone ? "text-green-400" : "text-on-surface-disabled"}`}
      >
        {request.hasMicrophone ? (
          <Mic className="w-3.5 h-3.5" />
        ) : (
          <MicOff className="w-3.5 h-3.5" />
        )}
      </span>

      {/* 메모 */}
      <p className="text-sm text-on-surface-medium truncate min-w-0 flex-1">
        {request.memo || "—"}
      </p>

      {/* 상태 */}
      <span
        className={`shrink-0 text-xs font-medium ${STATUS_COLORS[request.status] ?? "text-on-surface-disabled"}`}
      >
        {tStatus(request.status)}
      </span>

      {/* 시간 */}
      <span className="shrink-0 text-xs text-on-surface-disabled hidden sm:inline">
        {format.relativeTime(new Date(request.createdAt))}
      </span>

      {/* 액션 버튼 */}
      <div className="shrink-0">
        <RequesterActionButtons
          requestId={request.id}
          status={request.status}
        />
      </div>
      </div>

      {/* 매칭 확정 시 파트너 정보 */}
      {isConfirmed && partner?.partnerGameName && (
        <div className="mt-2 pt-2 border-t border-divider flex items-center gap-1.5 text-xs">
          <span className="text-on-surface-disabled">{t("partner")}</span>
          <PartnerName
            gameName={partner.partnerGameName}
            tagLine={partner.partnerTagLine}
          />
        </div>
      )}
    </div>
  );
}
