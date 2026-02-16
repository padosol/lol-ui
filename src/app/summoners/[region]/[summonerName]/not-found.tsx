"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import SummonerNotFound from "@/components/summoner/SummonerNotFound";
import { useParams } from "next/navigation";

export default function NotFoundPage() {
  const params = useParams();
  const region = params.region as string;
  const rawSummonerName = params.summonerName as string;

  // URL 디코딩
  const decodedSummonerName = decodeURIComponent(rawSummonerName);

  // 소환사명과 태그라인 분리 (예: "HideOnBush-KR1" -> name: "HideOnBush", tagline: "KR1")
  const dashIndex = decodedSummonerName.lastIndexOf("-");
  let summonerName: string;
  let tagline: string | undefined;

  if (dashIndex !== -1) {
    summonerName = decodedSummonerName.slice(0, dashIndex);
    tagline = decodedSummonerName.slice(dashIndex + 1);
  } else {
    summonerName = decodedSummonerName;
    tagline = undefined;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1">
        <SummonerNotFound
          summonerName={summonerName}
          tagline={tagline}
          region={region}
        />
      </main>
      <Footer />
    </div>
  );
}
