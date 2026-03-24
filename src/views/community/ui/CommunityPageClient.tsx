"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { CommunityListPanel } from "@/widgets/community-list";

export default function CommunityPageClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="max-w-[1024px] px-4 sm:px-0">
          <CommunityListPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
