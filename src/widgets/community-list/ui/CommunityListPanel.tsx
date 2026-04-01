"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  usePosts,
  useSearchPosts,
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  POST_SORT_LABELS,
  POST_PERIOD_LABELS,
} from "@/entities/community";
import type { PostCategory, PostSort, PostPeriod } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { CommunitySearchBar } from "@/features/community-search";
import PostCard from "./PostCard";

const CATEGORIES: (PostCategory | "ALL")[] = ["ALL", ...POST_CATEGORIES];
const SORTS: PostSort[] = ["HOT", "NEW", "TOP"];
const PERIODS: PostPeriod[] = ["DAILY", "WEEKLY", "MONTHLY", "ALL"];

export default function CommunityListPanel() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState<PostCategory | "ALL">("ALL");
  const [sort, setSort] = useState<PostSort>("HOT");
  const [period, setPeriod] = useState<PostPeriod>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [sortOpen, setSortOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
      setSortOpen(false);
    }
    if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
      setPeriodOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const postsQuery = usePosts({
    category: category === "ALL" ? undefined : category,
    sort,
    period,
  });

  const searchQuery = useSearchPosts(searchKeyword);

  const isSearching = searchKeyword.length > 0;
  const posts = useMemo(() => {
    if (isSearching) {
      return searchQuery.data?.content ?? [];
    }
    return postsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  }, [isSearching, searchQuery.data, postsQuery.data]);

  const isLoading = isSearching ? searchQuery.isLoading : postsQuery.isLoading;
  const hasNextPage = isSearching ? false : postsQuery.hasNextPage;

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
  };

  const handleWriteClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/community/write");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">커뮤니티</h1>
        <button
          type="button"
          onClick={handleWriteClick}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-on-surface font-medium px-4 py-2 rounded-md text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          글쓰기
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              setSearchKeyword("");
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              category === cat
                ? "bg-primary text-on-surface"
                : "bg-surface-4 hover:bg-surface-8 border border-divider text-on-surface-medium"
            }`}
          >
            {cat === "ALL" ? "전체" : POST_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 정렬 + 기간 + 검색 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 정렬 드롭다운 */}
        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[80px] text-left"
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            {POST_SORT_LABELS[sort]}
            <ChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sortOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1" role="listbox" aria-label="정렬 선택">
                {SORTS.map((s) => {
                  const selected = s === sort;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                        selected
                          ? "bg-surface-8 text-on-surface font-medium"
                          : "text-on-surface hover:bg-surface-8"
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      {POST_SORT_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 기간 드롭다운 */}
        <div ref={periodRef} className="relative">
          <button
            type="button"
            onClick={() => setPeriodOpen((v) => !v)}
            className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[90px] text-left"
            aria-haspopup="listbox"
            aria-expanded={periodOpen}
          >
            {POST_PERIOD_LABELS[period]}
            <ChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${periodOpen ? "rotate-180" : ""}`}
            />
          </button>
          {periodOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1" role="listbox" aria-label="기간 선택">
                {PERIODS.map((p) => {
                  const selected = p === period;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPeriod(p);
                        setPeriodOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                        selected
                          ? "bg-surface-8 text-on-surface font-medium"
                          : "text-on-surface hover:bg-surface-8"
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      {POST_PERIOD_LABELS[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <CommunitySearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* 검색 상태 표시 */}
      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-on-surface-medium">
          <span>&ldquo;{searchKeyword}&rdquo; 검색 결과</span>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-primary hover:underline cursor-pointer"
          >
            검색 초기화
          </button>
        </div>
      )}

      {/* 게시글 목록 */}
      {isLoading ? (
        <div className="text-center py-16 text-on-surface-disabled">
          로딩 중...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-on-surface-disabled">
          {isSearching ? "검색 결과가 없습니다" : "게시글이 없습니다"}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 더 보기 */}
      {hasNextPage && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => postsQuery.fetchNextPage()}
            disabled={postsQuery.isFetchingNextPage}
            className="px-6 py-2 bg-surface-4 hover:bg-surface-8 border border-divider rounded-md text-sm text-on-surface-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {postsQuery.isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
