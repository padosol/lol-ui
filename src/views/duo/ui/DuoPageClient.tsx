"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { DuoListPanel } from "@/widgets/duo-list";

export default function DuoPageClient() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="max-w-[1024px] px-4 sm:px-0">
          <DuoListPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
