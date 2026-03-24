"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { PostDetailPanel } from "@/widgets/community-detail";

interface CommunityDetailPageClientProps {
  postId: number;
}

export default function CommunityDetailPageClient({ postId }: CommunityDetailPageClientProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="max-w-[1024px] px-4 sm:px-0">
          <PostDetailPanel postId={postId} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
