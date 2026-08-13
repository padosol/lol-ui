"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { CommunityListPanel } from "@/widgets/community-list";
import type {
  CategoryTree,
  PostCategory,
  PostListResponse,
} from "@/entities/community";

interface CommunityPageClientProps {
  /** 서버가 URL 로 해석한 게시판. 전체 목록이면 "ALL". */
  category: PostCategory | "ALL";
  initialTree?: CategoryTree;
  initialPosts?: PostListResponse;
}

export default function CommunityPageClient({
  category,
  initialTree,
  initialPosts,
}: CommunityPageClientProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommunityListPanel
          category={category}
          initialTree={initialTree}
          initialPosts={initialPosts}
        />
      </main>
      <Footer />
    </div>
  );
}
