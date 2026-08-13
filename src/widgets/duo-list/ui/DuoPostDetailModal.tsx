"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Mic, MicOff, Trash2, Pencil } from "lucide-react";
import {
  useDuoPostDetail,
  useDeleteDuoPost,
  useDuoMatchResult,
  LANE_IMAGE_KEY,
} from "@/entities/duo";
import type { DuoPost, DuoRequest } from "@/entities/duo";
import { useAuthStore } from "@/entities/auth";
import { getPositionImageUrl } from "@/shared/lib/position";
import { useTierName } from "@/shared/lib/useTierName";
import { useRelativeNow } from "@/shared/i18n";
import { useFormatter, useTranslations } from "next-intl";
import { RequestActionButtons } from "@/features/duo-matching";
import { DuoRequestModal } from "@/features/duo-request";
import PartnerName from "./PartnerName";

interface DuoPostDetailModalProps {
  postId: number | null;
  onClose: () => void;
}

export default function DuoPostDetailModal({
  postId,
  onClose,
}: DuoPostDetailModalProps) {
  const t = useTranslations("duo.detail");
  const { data: post, isLoading } = useDuoPostDetail(postId);
  const deletePost = useDeleteDuoPost();
  const user = useAuthStore((s) => s.user);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  useEffect(() => {
    if (postId === null) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [postId]);

  useEffect(() => {
    if (postId === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [postId, onClose]);

  if (postId === null) return null;

  const handleDelete = () => {
    if (!confirm(t("deleteConfirm"))) return;
    deletePost.mutate(postId, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-surface-4 rounded-lg border border-divider w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-on-surface">{t("title")}</h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-on-surface-disabled hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-surface-8 rounded w-1/2" />
              <div className="h-4 bg-surface-8 rounded w-3/4" />
              <div className="h-4 bg-surface-8 rounded w-1/2" />
            </div>
          ) : post ? (
            <PostContent
              post={post}
              isOwner={post.isOwner ?? false}
              isLoggedIn={!!user}
              onDelete={handleDelete}
              isDeleting={deletePost.isPending}
              onRequestClick={() => setRequestModalOpen(true)}
            />
          ) : (
            <p className="text-on-surface-disabled text-center py-8">
              {t("notFound")}
            </p>
          )}
        </div>
      </div>

      {postId && (
        <DuoRequestModal
          open={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          postId={postId}
        />
      )}
    </>
  );
}

function PostContent({
  post,
  isOwner,
  isLoggedIn,
  onDelete,
  isDeleting,
  onRequestClick,
}: {
  post: DuoPost;
  isOwner: boolean;
  isLoggedIn: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onRequestClick: () => void;
}) {
  const format = useFormatter();
  const now = useRelativeNow();
  const t = useTranslations("duo");
  const tDetail = useTranslations("duo.detail");
  const tLane = useTranslations("domain.position");
  const getTierName = useTierName();
  const tier = post.tier;
  const isMasterPlus = tier !== null && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);

  return (
    <div className="space-y-5">
      {/* 게시글 정보 */}
      <div className="space-y-3">
        {/* 라인 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Image
              src={getPositionImageUrl(LANE_IMAGE_KEY[post.primaryLane])}
              alt={tLane(post.primaryLane)}
              width={24}
              height={24}
            />
            <span className="font-medium text-on-surface">
              {tLane(post.primaryLane)}
            </span>
          </div>
          <span className="text-on-surface-disabled">/</span>
          <div className="flex items-center gap-1.5">
            <Image
              src={getPositionImageUrl(LANE_IMAGE_KEY[post.desiredLane])}
              alt={tLane(post.desiredLane)}
              width={20}
              height={20}
              className="opacity-70"
            />
            <span className="text-sm text-on-surface-medium">
              {tLane(post.desiredLane)}
            </span>
          </div>
        </div>

        {/* 티어 */}
        <p className="text-sm text-on-surface-medium">
          {tier !== null ? (
            <>{getTierName(tier)} {isMasterPlus ? "" : post.rank}{" "}{post.leaguePoints}LP</>
          ) : (
            <span className="text-on-surface-disabled">{t("unranked")}</span>
          )}
        </p>

        {/* 마이크 */}
        <div
          className={`inline-flex items-center gap-1.5 text-sm ${post.hasMicrophone ? "text-green-400" : "text-on-surface-disabled"}`}
        >
          {post.hasMicrophone ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
          {post.hasMicrophone ? t("micOn") : t("micOff")}
        </div>

        {/* 메모 */}
        {post.memo && (
          <p className="text-sm text-on-surface leading-relaxed bg-surface-1 border border-divider rounded-md p-3">
            {post.memo}
          </p>
        )}

        {/* 작성 시간 */}
        <p className="text-xs text-on-surface-disabled">
          {format.relativeTime(new Date(post.createdAt), now)}
        </p>
      </div>

      {/* 액션 영역 */}
      {isOwner ? (
        <OwnerSection
          post={post}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ) : isLoggedIn ? (
        <div>
          {post.status === "ACTIVE" && (
            <button
              type="button"
              onClick={onRequestClick}
              className="cursor-pointer w-full bg-primary hover:bg-primary/80 text-on-surface font-medium py-2.5 rounded-md transition-colors"
            >
              {tDetail("requestDuo")}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-on-surface-disabled text-center py-4 border-t border-divider">
          {tDetail("loginRequired")}
        </p>
      )}
    </div>
  );
}

function OwnerSection({
  post,
  onDelete,
  isDeleting,
}: {
  post: DuoPost;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const t = useTranslations("duo.detail");
  const tCommon = useTranslations("common");
  const matchResult = useDuoMatchResult(post.id, post.status === "MATCHED");
  const partner = matchResult.data;

  return (
    <div className="space-y-4 border-t border-divider pt-4">
      {/* 매칭 완료 시 파트너 정보 */}
      {post.status === "MATCHED" && partner?.partnerGameName && (
        <div className="bg-primary/10 border border-primary/30 rounded-md p-3 text-sm">
          <span className="text-on-surface-medium">
            {t("matchedWithPartner")}
          </span>
          <PartnerName
            gameName={partner.partnerGameName}
            tagLine={partner.partnerTagLine}
          />
        </div>
      )}

      {/* 소유자 액션 */}
      {post.status === "ACTIVE" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-4 border border-divider text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {isDeleting ? t("deleting") : tCommon("delete")}
          </button>
        </div>
      )}

      {/* 받은 요청 목록 */}
      <div>
        <h3 className="text-sm font-medium text-on-surface mb-3">
          {t("receivedRequests", { count: post.requests?.length ?? 0 })}
        </h3>
        {!post.requests || post.requests.length === 0 ? (
          <p className="text-xs text-on-surface-disabled">
            {t("noRequests")}
          </p>
        ) : (
          <div className="space-y-3">
            {post.requests.map((req) => (
              <RequestItem key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestItem({ request }: { request: DuoRequest }) {
  const t = useTranslations("duo");
  const tLane = useTranslations("domain.position");
  const tStatus = useTranslations("domain.duoRequestStatus");
  const getTierName = useTierName();
  const tier = request.tier;
  const isMasterPlus = tier !== null && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);

  return (
    <div className="bg-surface-1 border border-divider rounded-md p-3 flex items-center gap-3">
      {/* 라인 아이콘 */}
      <div className="flex items-center gap-1 shrink-0">
        <Image
          src={getPositionImageUrl(LANE_IMAGE_KEY[request.primaryLane])}
          alt={tLane(request.primaryLane)}
          width={16}
          height={16}
        />
        <span className="text-on-surface-disabled text-xs">/</span>
        <Image
          src={getPositionImageUrl(LANE_IMAGE_KEY[request.desiredLane])}
          alt={tLane(request.desiredLane)}
          width={14}
          height={14}
          className="opacity-70"
        />
      </div>

      {/* 티어 */}
      <span className="text-xs text-on-surface-medium shrink-0 w-24 truncate">
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
          <Mic className="w-3 h-3" />
        ) : (
          <MicOff className="w-3 h-3" />
        )}
      </span>

      {/* 메모 */}
      <p className="text-xs text-on-surface-medium truncate min-w-0 flex-1">
        {request.memo || "—"}
      </p>

      {/* 상태 */}
      <span className="shrink-0 text-xs text-on-surface-disabled">
        {tStatus(request.status)}
      </span>

      {/* 액션 버튼 */}
      <div className="shrink-0">
        <RequestActionButtons
          requestId={request.id}
          status={request.status}
        />
      </div>
    </div>
  );
}
