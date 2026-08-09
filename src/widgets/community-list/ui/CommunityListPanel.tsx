"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PenLine, ChevronDown } from "lucide-react";
import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  usePosts,
  useSearchPosts,
  POST_CATEGORIES,
  POST_SORTS,
  POST_PERIODS,
  PostRow,
} from "@/entities/community";
import type { PostCategory } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { CommunitySearchBar } from "@/features/community-search";
import BoardSidebar from "./BoardSidebar";
import CommunityAside from "./CommunityAside";

type CategoryValue = PostCategory | "ALL";

const CATEGORIES: CategoryValue[] = ["ALL", ...POST_CATEGORIES];
const SORTS = POST_SORTS;
const PERIODS = POST_PERIODS;

export default function CommunityListPanel() {
  const t = useTranslations("community");
  const tCategory = useTranslations("domain.postCategory");
  const tSort = useTranslations("domain.postSort");
  const tPeriod = useTranslations("domain.postPeriod");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState<CategoryValue>("ALL");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("HOT");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
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

  const handleSelectCategory = (next: CategoryValue) => {
    setCategory(next);
    setSearchKeyword("");
  };

  const handleWriteClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/community/write");
  };

  const boardTitle = category === "ALL" ? t("title") : tCategory(category);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[176px_minmax(0,1fr)] xl:grid-cols-[176px_minmax(0,1fr)_280px]">
      <aside className="hidden lg:block sticky top-[66px]">
        <BoardSidebar category={category} onSelect={handleSelectCategory} />
      </aside>

      <main className="min-w-0 flex flex-col gap-3">
        {/* 좁은 화면: 좌측 사이드바 대신 가로 스크롤 게시판 탭 */}
        <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((value) => {
            const active = value === category;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelectCategory(value)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-surface font-bold"
                    : "bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8"
                }`}
              >
                {value === "ALL" ? t("allCategories") : tCategory(value)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-on-surface">{boardTitle}</h1>

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
          <div className="flex-1 min-w-[180px]">
            <CommunitySearchBar onSearch={setSearchKeyword} />
          </div>

          <div ref={periodRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setPeriodOpen((v) => !v)}
              className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-2 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[90px] text-left"
              aria-haspopup="listbox"
              aria-expanded={periodOpen}
            >
              {tPeriod(period)}
              <ChevronDown
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${periodOpen ? "rotate-180" : ""}`}
              />
            </button>
            {periodOpen && (
              <div className="absolute top-full right-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="py-1" role="listbox" aria-label={t("periodSelect")}>
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
                        {tPeriod(p)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
