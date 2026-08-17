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
      <main className="flex-1 w-full max-w-[920px] mx-auto px-4 sm:px-6 py-6">
        <PostDetailPanel postId={postId} />
      </main>
      <Footer />
    </div>
  );
}
