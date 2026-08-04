"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { useParams } from "next/navigation";

export default function ChampionNotFoundPage() {
  const params = useParams();
  const championId = (params?.championId as string) ?? "";

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-5xl mx-auto py-8">
        <div className="text-center py-20">
          <p className="text-lg text-on-surface-medium">
            챔피언을 찾을 수 없습니다:{" "}
            <span className="font-medium text-on-surface">{championId}</span>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
