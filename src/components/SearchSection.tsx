"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchSection() {
  const [region, setRegion] = useState("KR");
  const [summonerName, setSummonerName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerName.trim()) {
      // TODO: 검색 로직 구현
      console.log(`Searching for ${summonerName} in ${region}`);
    }
  };

  return (
    <section className="bg-gray-900 border-b border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              {/* 리전 선택 */}
              <button
                type="button"
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-l-lg border border-gray-700 border-r-0 font-medium text-sm text-gray-200 min-w-[80px]"
              >
                {region}
              </button>

              {/* 검색 입력 */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={summonerName}
                  onChange={(e) => setSummonerName(e.target.value)}
                  placeholder="Game name + #KR1"
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                  Game name + #{region}1
                </div>
              </div>

              {/* 검색 버튼 */}
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center justify-center"
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

