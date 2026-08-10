"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { CommunityListPanel } from "@/widgets/community-list";

export default function CommunityPageClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommunityListPanel />
      </main>
      <Footer />
    </div>
  );
}
