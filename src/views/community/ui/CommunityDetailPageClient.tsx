"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { PostDetailPanel } from "@/widgets/community-detail";
import type { Post } from "@/entities/community";

interface CommunityDetailPageClientProps {
  postId: number;
  /** 서버가 이미 받아온 글. 넘어오면 클라이언트가 같은 글을 다시 받지 않는다. */
  initialPost?: Post;
}

export default function CommunityDetailPageClient({
  postId,
  initialPost,
}: CommunityDetailPageClientProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[920px] mx-auto px-4 sm:px-6 py-6">
        <PostDetailPanel postId={postId} initialPost={initialPost} />
      </main>
      <Footer />
    </div>
  );
}
