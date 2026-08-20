"use client";

import { useState, useMemo } from "react";
import { PenLine } from "lucide-react";
import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  usePosts,
  useSearchPosts,
  useCategoryLabel,
  POST_SORTS,
} from "@/entities/community";
import type {
  CategoryId,
  PostListResponse,
  PostPeriod,
} from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import {
  CommunitySearchBar,
  DEFAULT_SEARCH_SCOPE,
  type SearchScope,
} from "@/features/community-search";
import PostList from "./PostList";
import LoadMoreButton from "./LoadMoreButton";

type CategoryValue = CategoryId | "ALL";
type PostSortValue = (typeof POST_SORTS)[number];

/** 노출 순서는 인기 → 추천 → 최신 (POST_SORTS 의 선언 순서와 다르다) */
const SORTS: PostSortValue[] = ["HOT", "TOP", "NEW"];
/** 기간 필터를 화면에서 뺐으므로 목록은 항상 전체 기간으로 조회한다. */
const LIST_PERIOD: PostPeriod = "ALL";

interface CommunityListPanelProps {
  /** 서버가 URL 로 해석한 현재 게시판. 화면 상태가 아니라 경로가 출처다. */
  category: CategoryValue;
  /** 서버가 실어 보낸 첫 페이지. 없으면 클라이언트가 직접 받아온다. */
  initialPosts?: PostListResponse;
}

/**
 * 게시판 목록 화면의 가운데 컬럼.
 *
 * 좌·우 사이드바는 CommunityShell 이 그린다 — 상세 화면도 같은 셸을 쓰기 때문에
 * 이 컴포넌트는 목록에만 집중한다.
 */
export default function CommunityListPanel({
  category,
  initialPosts,
}: Readonly<CommunityListPanelProps>) {
  const t = useTranslations("community");
  const tSort = useTranslations("domain.postSort");
  const categoryLabel = useCategoryLabel();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [sort, setSort] = useState<PostSortValue>("HOT");
  const [searchKeyword, setSearchKeyword] = useState("");
  // 검색 범위는 아직 서버가 받지 않아 화면 표시용으로만 들고 있는다.
  const [, setSearchScope] = useState<SearchScope>(DEFAULT_SEARCH_SCOPE);

  const postsQuery = usePosts(
    {
      categoryId: category === "ALL" ? undefined : category,
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

  return (
    <>
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

      <PostList
        posts={posts}
        isLoading={isLoading}
        emptyLabel={isSearching ? t("emptySearch") : t("empty")}
      />

      {hasNextPage && (
        <LoadMoreButton
          onClick={() => postsQuery.fetchNextPage()}
          isLoading={postsQuery.isFetchingNextPage}
        />
      )}
    </>
  );
}
