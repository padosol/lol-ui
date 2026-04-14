"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/entities/auth";
import { useDuoPosts } from "@/entities/duo";
import type { Lane, Tier } from "@/entities/duo";
import { DuoFilters } from "@/features/duo-filter";
import { DuoRegisterModal } from "@/features/duo-register";
import DuoPostList from "./DuoPostList";
import DuoPostDetailModal from "./DuoPostDetailModal";
import MyDuoPostsPanel from "./MyDuoPostsPanel";
import MyDuoRequestsPanel from "./MyDuoRequestsPanel";

type DuoTab = "posts" | "my-posts" | "my-requests";

export default function DuoListPanel() {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<DuoTab>("posts");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // 필터 상태
  const [lane, setLane] = useState<Lane | "ALL">("ALL");
  const [tier, setTier] = useState<Tier | "ALL">("ALL");

  const filterParams = useMemo(
    () => ({
      ...(lane !== "ALL" && { lane }),
      ...(tier !== "ALL" && { tier }),
    }),
    [lane, tier],
  );

  const postsQuery = useDuoPosts(filterParams);
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [postsQuery.data],
  );

  const tabs: { key: DuoTab; label: string; requireAuth: boolean }[] = [
    { key: "posts", label: "게시글 목록", requireAuth: false },
    { key: "my-posts", label: "내 게시글", requireAuth: true },
    { key: "my-requests", label: "내 요청", requireAuth: true },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-on-surface">듀오 찾기</h1>
          {user && (
            <button
              type="button"
              onClick={() => setRegisterModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-on-surface font-medium px-4 py-2 rounded-md text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              듀오 등록
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
                {tab.label}
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
