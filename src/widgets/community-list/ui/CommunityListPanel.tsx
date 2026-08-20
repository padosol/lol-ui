"use client";

import { useMemo, useTransition } from "react";
import { PenLine } from "lucide-react";
import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  usePosts,
  useSearchPosts,
  useCategoryLabel,
  listHref,
} from "@/entities/community";
import type {
  CategoryId,
  PostListResponse,
  PostPeriod,
  PostSort,
} from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import {
  CommunitySearchBar,
  type SearchScope,
} from "@/features/community-search";
import PostList from "./PostList";
import LoadMoreButton from "./LoadMoreButton";

type CategoryValue = CategoryId | "ALL";

/** 노출 순서는 인기 → 추천 → 최신 (POST_SORTS 의 선언 순서와 다르다) */
const SORTS: PostSort[] = ["HOT", "TOP", "NEW"];
/** 기간 필터를 화면에서 뺐으므로 목록은 항상 전체 기간으로 조회한다. */
const LIST_PERIOD: PostPeriod = "ALL";

interface CommunityListPanelProps {
  /** 서버가 URL 로 해석한 현재 게시판. 화면 상태가 아니라 경로가 출처다. */
  category: CategoryValue;
  /** 서버가 URL 로 해석한 정렬. 정렬 버튼은 이 값을 바꾸는 게 아니라 URL 을 바꾼다. */
  sort: PostSort;
  /** 서버가 URL 로 해석한 검색어. 비어 있으면 검색이 아니라 목록이다. */
  keyword: string;
  /** 서버가 실어 보낸 첫 페이지. 위 정렬로 받아온 것이다. */
  initialPosts?: PostListResponse;
}

/**
 * 게시판 목록 화면의 가운데 컬럼.
 *
 * 좌·우 사이드바는 CommunityShell 이 그린다 — 상세 화면도 같은 셸을 쓰기 때문에
 * 이 컴포넌트는 목록에만 집중한다.
 *
 * 정렬과 검색어는 화면 상태로 들고 있지 않고 URL 에 맡긴다. 조건을 바꾸면 주소가
 * 바뀌고, 서버가 그 조건으로 받은 첫 페이지를 다시 내려준다 — 조건이 바뀔 때마다
 * 클라이언트가 같은 목록을 한 번 더 받지 않게 하려는 것이다.
 */
export default function CommunityListPanel({
  category,
  sort,
  keyword,
  initialPosts,
}: Readonly<CommunityListPanelProps>) {
  const t = useTranslations("community");
  const tSort = useTranslations("domain.postSort");
  const categoryLabel = useCategoryLabel();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  // 주소가 바뀌고 서버 응답이 오기까지의 텀. 이 사이 목록을 흐려 눌린 것을 알린다.
  const [isSwitching, startSwitching] = useTransition();

  const postsQuery = usePosts(
    {
      categoryId: category === "ALL" ? undefined : category,
      sort,
      period: LIST_PERIOD,
    },
    initialPosts
  );

  const searchQuery = useSearchPosts(keyword);

  const isSearching = keyword.length > 0;
  const posts = useMemo(() => {
    if (isSearching) {
      return searchQuery.data?.content ?? [];
    }
    return postsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  }, [isSearching, searchQuery.data, postsQuery.data]);

  const isLoading = isSearching ? searchQuery.isLoading : postsQuery.isLoading;
  const hasNextPage = isSearching ? false : postsQuery.hasNextPage;

  const goTo = (next: { sort?: PostSort; keyword?: string }) => {
    startSwitching(() => {
      router.replace(
        listHref(category, {
          sort: next.sort ?? sort,
          keyword: next.keyword ?? keyword,
        }),
        // 정렬만 바꿨을 뿐인데 맨 위로 튀지 않게 한다
        { scroll: false }
      );
    });
  };

  // 검색 범위는 아직 서버가 받지 않아 화면 표시용으로만 존재한다.
  const handleSearch = (nextKeyword: string, _scope: SearchScope) => {
    goTo({ keyword: nextKeyword });
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
                onClick={() => goTo({ sort: value })}
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
          <CommunitySearchBar
            initialKeyword={keyword}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-on-surface-medium">
          <span>{t("searchResult", { keyword })}</span>
          <button
            type="button"
            onClick={() => goTo({ keyword: "" })}
            className="text-primary hover:underline cursor-pointer"
          >
            {t("resetSearch")}
          </button>
        </div>
      )}

      <div className={isSwitching ? "opacity-60 transition-opacity" : undefined}>
        <PostList
          posts={posts}
          isLoading={isLoading}
          emptyLabel={isSearching ? t("emptySearch") : t("empty")}
          listSort={sort}
        />
      </div>

      {hasNextPage && (
        <LoadMoreButton
          onClick={() => postsQuery.fetchNextPage()}
          isLoading={postsQuery.isFetchingNextPage}
        />
      )}
    </>
  );
}
