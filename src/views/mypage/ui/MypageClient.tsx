"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/auth";
import { Header, Navigation, Footer } from "@/widgets/layout";
import { MypagePanel } from "@/widgets/mypage-panel";

export default function MypageClient() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-on-surface mb-8">내 계정</h1>
          <MypagePanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
