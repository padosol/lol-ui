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
    <div className="min-h-screen bg-gray-900 flex items-start justify-center pt-20">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-700">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            존재하지 않는 유저
          </h1>
          <p className="text-gray-400 text-lg mb-1">
            입력하신 소환사명: <span className="text-white">{summonerName}</span>
            {tagline && (
              <span className="text-gray-500 ml-1">#{tagline}</span>
            )}
          </p>
          <p className="text-gray-500 text-sm">
            소환사명과 태그라인을 정확히 입력해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 cursor-pointer text-white rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

