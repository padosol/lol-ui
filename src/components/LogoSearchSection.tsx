"use client";

import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeRegion } from "@/utils/summoner";

export default function LogoSearchSection() {
  const router = useRouter();
  const [region, setRegion] = useState("KR");
  const [summonerName, setSummonerName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = summonerName.trim();
    if (trimmedName) {
      // 입력값을 URL 인코딩하여 소환사 상세 페이지로 이동
      const encodedName = encodeURIComponent(trimmedName);
      const normalizedRegion = normalizeRegion(region);
      router.push(`/summoners/${normalizedRegion}/${encodedName}`);
    }
  };

  return (
    <section className="bg-gray-900 border-b border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">
          {/* 로고 영역 - 이미지가 들어갈 공간 */}
          <div className="flex items-center justify-center">
            <div className="w-64 h-32 flex items-center justify-center">
              {/* 추후 이미지로 교체될 공간 */}
              <h1 className="text-3xl font-bold text-blue-500">MMRTR</h1>
            </div>
          </div>

          {/* 검색 영역 */}
          <div className="w-full max-w-2xl -mt-4">
            <form onSubmit={handleSearch} className="flex gap-0 items-stretch">
              {/* 리전 선택 */}
              <div className="relative flex">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="px-4 py-3 pr-10 bg-gray-800 hover:bg-gray-700 rounded-l-lg border-t border-b border-l border-gray-700 border-r border-gray-600 font-medium text-sm text-gray-200 min-w-[100px] cursor-pointer focus:outline-none appearance-none h-full"
                >
                  <option value="KR">한국</option>
                  <option value="US">미국</option>
                  <option value="JP">일본</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* 검색 입력 */}
              <div className="flex-1 relative flex">
                <input
                  type="text"
                  value={summonerName}
                  onChange={(e) => setSummonerName(e.target.value)}
                  placeholder="Game name + #KR1"
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 border-l-0 border-r-0 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-full"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                  Game name + #{region}1
                </div>
              </div>

              {/* 검색 버튼 */}
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg flex items-center justify-center border border-l-0 border-blue-500 h-full"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
