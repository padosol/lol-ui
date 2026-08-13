"use client";

import { useState, useMemo } from "react";
import { PenLine } from "lucide-react";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  usePosts,
  useSearchPosts,
  useCategoryTree,
  useCategoryLabel,
  useVisibleCategories,
  categoryHref,
  POST_SORTS,
  PostRow,
} from "@/entities/community";
import type {
  CategoryTree,
  PostCategory,
  PostListResponse,
  PostPeriod,
} from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import {
  CommunitySearchBar,
  DEFAULT_SEARCH_SCOPE,
  type SearchScope,
} from "@/features/community-search";
import BoardSidebar from "./BoardSidebar";
import CommunityAside from "./CommunityAside";

type CategoryValue = PostCategory | "ALL";
type PostSortValue = (typeof POST_SORTS)[number];

/** 노출 순서는 인기 → 추천 → 최신 (POST_SORTS 의 선언 순서와 다르다) */
const SORTS: PostSortValue[] = ["HOT", "TOP", "NEW"];
/** 기간 필터를 화면에서 뺐으므로 목록은 항상 전체 기간으로 조회한다. */
const LIST_PERIOD: PostPeriod = "ALL";

interface CommunityListPanelProps {
  /** 서버가 URL 로 해석한 현재 게시판. 화면 상태가 아니라 경로가 출처다. */
  category: CategoryValue;
  /** 서버가 실어 보낸 게시판 트리·첫 페이지. 없으면 클라이언트가 직접 받아온다. */
  initialTree?: CategoryTree;
  initialPosts?: PostListResponse;
}

export default function CommunityListPanel({
  category,
  initialTree,
  initialPosts,
}: CommunityListPanelProps) {
  const t = useTranslations("community");
  const tSort = useTranslations("domain.postSort");
  const categoryTree = useCategoryTree(initialTree);
  const categoryLabel = useCategoryLabel();
  // 모바일 가로 스크롤 탭은 그룹 구분 없이 늘어놓으므로 여기서만 평평하게 쓴다.
  const visibleCategories = useVisibleCategories();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [sort, setSort] = useState<PostSortValue>("HOT");
  const [searchKeyword, setSearchKeyword] = useState("");
  // 검색 범위는 아직 서버가 받지 않아 화면 표시용으로만 들고 있는다.
  const [, setSearchScope] = useState<SearchScope>(DEFAULT_SEARCH_SCOPE);

  const postsQuery = usePosts(
    {
      category: category === "ALL" ? undefined : category,
      sort,
      period: LIST_PERIOD,
    },
    // 서버가 내려준 첫 페이지는 기본 정렬 기준이라, 정렬을 바꾼 뒤에는 쓰지 않는다.
    sort === "HOT" ? initialPosts : undefined
  );

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

  const handleSearch = (keyword: string, scope: SearchScope) => {
    setSearchScope(scope);
    setSearchKeyword(keyword);
  };

  const handleWriteClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/community/write");
  };

  // 전체 선택 시에는 페이지 제목("커뮤니티")이 아니라 게시판 이름 자리에 맞춰 "전체"를 쓴다.
  const boardTitle =
    category === "ALL" ? t("allCategories") : categoryLabel(category);

  const mobileTabs: CategoryValue[] = [
    "ALL",
    ...visibleCategories.map((item) => item.code),
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[176px_minmax(0,1fr)] xl:grid-cols-[176px_minmax(0,1fr)_280px]">
      <aside className="hidden lg:block sticky top-[66px]">
        <BoardSidebar
          category={category}
          groups={categoryTree.data?.groups ?? []}
          isLoading={categoryTree.isLoading}
        />
      </aside>

      <main className="min-w-0 flex flex-col gap-3">
        {/* 좁은 화면: 좌측 사이드바 대신 가로 스크롤 게시판 탭 */}
        <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1">
          {mobileTabs.map((value) => {
            const active = value === category;
            return (
              <Link
                key={value}
                href={categoryHref(value)}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-surface font-bold"
                    : "bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8"
                }`}
              >
                {value === "ALL" ? t("allCategories") : categoryLabel(value)}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-on-surface">{boardTitle}</h1>

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleWriteClick}
            className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/80 text-surface font-bold px-4 py-2 text-[13.5px] transition-colors cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            {t("write")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0.5">
            {SORTS.map((value) => {
              const active = value === sort;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSort(value)}
                  aria-pressed={active}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
                    active
                      ? "bg-surface-8 font-bold text-on-surface"
                      : "font-medium text-on-surface-disabled hover:bg-surface-4 hover:text-on-surface-medium"
                  }`}
                >
                  {tSort(value)}
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <div className="w-full sm:w-auto sm:min-w-[280px]">
            <CommunitySearchBar onSearch={handleSearch} />
          </div>
        </div>

        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-on-surface-medium">
            <span>{t("searchResult", { keyword: searchKeyword })}</span>
            <button
              type="button"
              onClick={() => setSearchKeyword("")}
              className="text-primary hover:underline cursor-pointer"
            >
              {t("resetSearch")}
            </button>
          </div>
        )}

        <div className="bg-surface-1 border border-divider rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-on-surface-disabled">
              {t("loading")}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-on-surface-disabled">
              {isSearching ? t("emptySearch") : t("empty")}
            </div>
          ) : (
            posts.map((post) => <PostRow key={post.id} post={post} />)
          )}
        </div>

        {hasNextPage && (
          <div className="pt-1 pb-4 text-center">
            <button
              type="button"
              onClick={() => postsQuery.fetchNextPage()}
              disabled={postsQuery.isFetchingNextPage}
              className="px-6 py-2 bg-surface-1 hover:bg-surface-4 border border-divider rounded-lg text-sm font-medium text-on-surface-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {postsQuery.isFetchingNextPage ? t("loading") : t("loadMore")}
            </button>
          </div>
        )}
      </main>

      <aside className="hidden xl:block sticky top-[66px]">
        <CommunityAside />
      </aside>
    </div>
  );
}
