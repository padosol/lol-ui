"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/entities/auth";
import { useDuoPosts, useDuoNotifications } from "@/entities/duo";
import type { Lane, Tier, DuoPostFilters } from "@/entities/duo";
import { DuoFilters } from "@/features/duo-filter";
import { DuoRegisterModal } from "@/features/duo-register";
import { useTranslations } from "next-intl";
import DuoPostList from "./DuoPostList";
import DuoPostDetailModal from "./DuoPostDetailModal";
import MyDuoPostsPanel from "./MyDuoPostsPanel";
import MyDuoRequestsPanel from "./MyDuoRequestsPanel";

type DuoTab = "posts" | "my-posts" | "my-requests";

export default function DuoListPanel() {
  const t = useTranslations("duo");
  const user = useAuthStore((s) => s.user);

  // 듀오 페이지 체류 중 실시간 알림 구독 → 수신 시 듀오 쿼리 자동 갱신
  useDuoNotifications(!!user);

  const [activeTab, setActiveTab] = useState<DuoTab>("posts");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // 필터 상태
  const [lane, setLane] = useState<Lane | "ALL">("ALL");
  const [tier, setTier] = useState<Tier | "ALL">("ALL");

  const filterParams = useMemo((): Omit<DuoPostFilters, "page"> => {
    const params: Omit<DuoPostFilters, "page"> = {};
    if (lane !== "ALL") params.lane = lane;
    if (tier !== "ALL") params.tier = tier;
    return params;
  }, [lane, tier]);

  const postsQuery = useDuoPosts(filterParams);
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [postsQuery.data],
  );

  const tabs = [
    { key: "posts", messageKey: "posts", requireAuth: false },
    { key: "my-posts", messageKey: "myPosts", requireAuth: true },
    { key: "my-requests", messageKey: "myRequests", requireAuth: true },
  ] as const satisfies readonly {
    key: DuoTab;
    messageKey: string;
    requireAuth: boolean;
  }[];

  return (
    <>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-on-surface">{t("title")}</h1>
          {user && (
            <button
              type="button"
              onClick={() => setRegisterModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-on-surface font-medium px-4 py-2 rounded-md text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("register")}
            </button>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-1 border-b border-divider">
          {tabs.map((tab) => {
            if (tab.requireAuth && !user) return null;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-on-surface-medium hover:text-primary border-transparent"
                }`}
              >
                {t(`tabs.${tab.messageKey}`)}
              </button>
            );
          })}
        </div>

        {/* 탭 내용 */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            <DuoFilters
              lane={lane}
              tier={tier}
              onLaneChange={setLane}
              onTierChange={setTier}
            />
            <DuoPostList
              posts={posts}
              isLoading={postsQuery.isLoading}
              hasNextPage={postsQuery.hasNextPage}
              isFetchingNextPage={postsQuery.isFetchingNextPage}
              onFetchNextPage={() => postsQuery.fetchNextPage()}
              onSelectPost={setSelectedPostId}
            />
          </div>
        )}

        {activeTab === "my-posts" && (
          <MyDuoPostsPanel onSelectPost={setSelectedPostId} />
        )}

        {activeTab === "my-requests" && <MyDuoRequestsPanel />}
      </div>

      {/* 모달 */}
      <DuoRegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
      <DuoPostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
}
