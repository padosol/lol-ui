"use client";

import type { ReactNode } from "react";
import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  useCategoryTree,
  useCategoryLabel,
  useVisibleCategories,
  categoryHref,
} from "@/entities/community";
import type { CategoryId, CategoryTree } from "@/entities/community";
import BoardSidebar from "./BoardSidebar";
import CommunityAside from "./CommunityAside";

type CategoryValue = CategoryId | "ALL";

interface CommunityShellProps {
  /** 사이드바에서 강조할 게시판. 목록은 URL 이, 상세는 글의 소속 게시판이 출처다. */
  activeCategory: CategoryValue;
  /** 서버가 실어 보낸 게시판 트리. 있으면 사이드바가 스켈레톤 없이 바로 선다. */
  initialTree?: CategoryTree;
  /**
   * 우측 사이드바(인기글·오늘 경기·리그 순위). 화면마다 API 3건이 붙으므로
   * 필요한 화면에서만 켠다.
   */
  showAside?: boolean;
  /**
   * 좁은 화면의 가로 스크롤 게시판 탭. 좌측 사이드바가 숨는 자리를 대신한다.
   * 상세에서는 본문 위가 아니라 글 아래 목록이 이동 수단이라 끈다.
   */
  showMobileTabs?: boolean;
  children: ReactNode;
}

/**
 * 커뮤니티 공통 셸 — 좌측 게시판 메뉴 · 본문 · 우측 사이드바의 3단 그리드.
 *
 * 목록과 상세가 같은 셸 위에 서야 글을 열어도 메뉴가 사라지지 않는다.
 * 가운데에 무엇이 오는지는 이 컴포넌트가 알지 못한다 — 조립은 views 가 한다
 * (widget 끼리 서로를 import 하지 않기 위한 제약이기도 하다).
 */
export default function CommunityShell({
  activeCategory,
  initialTree,
  showAside = false,
  showMobileTabs = false,
  children,
}: Readonly<CommunityShellProps>) {
  const t = useTranslations("community");
  const categoryTree = useCategoryTree(initialTree);
  const categoryLabel = useCategoryLabel();
  // 모바일 탭은 그룹 구분 없이 늘어놓으므로 평평한 목록을 쓴다.
  const visibleCategories = useVisibleCategories();

  // 우측을 끄면 컬럼이 하나 줄어든다. Tailwind 가 클래스 문자열을 정적으로
  // 훑으므로 조각을 이어 붙이지 않고 완성된 문자열 중 하나를 고른다.
  const gridClass = showAside
    ? "lg:grid-cols-[176px_minmax(0,1fr)] xl:grid-cols-[176px_minmax(0,1fr)_280px]"
    : "lg:grid-cols-[176px_minmax(0,1fr)]";

  const mobileTabs: CategoryValue[] = [
    "ALL",
    ...visibleCategories.map((item) => item.id),
  ];

  return (
    <div className={`grid grid-cols-1 items-start gap-6 ${gridClass}`}>
      <aside className="hidden lg:block sticky top-[66px] max-h-[calc(100vh-74px)] overflow-y-auto">
        <BoardSidebar
          category={activeCategory}
          groups={categoryTree.data?.groups ?? []}
          isLoading={categoryTree.isLoading}
        />
      </aside>

      <main className="min-w-0 flex flex-col gap-3">
        {showMobileTabs && (
          <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1">
            {mobileTabs.map((value) => {
              const active = value === activeCategory;
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
        )}

        {children}
      </main>

      {showAside && (
        <aside className="hidden xl:block sticky top-[66px] max-h-[calc(100vh-74px)] overflow-y-auto">
          <CommunityAside />
        </aside>
      )}
    </div>
  );
}
