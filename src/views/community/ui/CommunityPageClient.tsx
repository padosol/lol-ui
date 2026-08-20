"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { CommunityShell } from "@/widgets/community-shell";
import { CommunityListPanel } from "@/widgets/community-list";
import type {
  CategoryId,
  CategoryTree,
  PostListResponse,
  PostSort,
} from "@/entities/community";

interface CommunityPageClientProps {
  /** 서버가 URL 로 해석한 게시판. 전체 목록이면 "ALL". */
  category: CategoryId | "ALL";
  /** 서버가 URL 로 해석한 정렬·검색어. */
  sort: PostSort;
  keyword: string;
  initialTree?: CategoryTree;
  initialPosts?: PostListResponse;
}

export default function CommunityPageClient({
  category,
  sort,
  keyword,
  initialTree,
  initialPosts,
}: Readonly<CommunityPageClientProps>) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      {/* main 은 셸이 가운데 컬럼에 세운다 — 사이드바까지 감싸면 중첩된다 */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommunityShell
          activeCategory={category}
          initialTree={initialTree}
          showAside
          showMobileTabs
        >
          <CommunityListPanel
            category={category}
            sort={sort}
            keyword={keyword}
            initialPosts={initialPosts}
          />
        </CommunityShell>
      </div>
      <Footer />
    </div>
  );
}
