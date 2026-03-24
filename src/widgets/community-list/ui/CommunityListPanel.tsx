"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
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
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-on-surface font-medium px-4 py-2 rounded-md text-sm transition-colors"
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
            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as PostSort)}
          className="bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>{POST_SORT_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PostPeriod)}
          className="bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{POST_PERIOD_LABELS[p]}</option>
          ))}
        </select>

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
            className="text-primary hover:underline"
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
            className="px-6 py-2 bg-surface-4 hover:bg-surface-8 border border-divider rounded-md text-sm text-on-surface-medium transition-colors disabled:opacity-50"
          >
            {postsQuery.isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
