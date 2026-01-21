"use client";

import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

interface SummonerNotFoundProps {
  summonerName: string;
  tagline?: string;
}

export default function SummonerNotFound({
  summonerName,
  tagline,
}: SummonerNotFoundProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface flex items-start justify-center pt-20">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-surface-4 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-divider">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            존재하지 않는 유저
          </h1>
          <p className="text-on-surface-medium text-lg mb-1">
            입력하신 소환사명: <span className="text-on-surface">{summonerName}</span>
            {tagline && (
              <span className="text-on-surface-disabled ml-1">#{tagline}</span>
            )}
          </p>
          <p className="text-on-surface-disabled text-sm">
            소환사명과 태그라인을 정확히 입력해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-6 hover:bg-surface-8 cursor-pointer text-on-surface rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

