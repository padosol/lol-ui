"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchSection() {
  const [region, _setRegion] = useState("KR");
  const [summonerName, setSummonerName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerName.trim()) {
      // TODO: 검색 로직 구현
      console.log(`Searching for ${summonerName} in ${region}`);
    }
  };

  return (
    <section className="bg-surface-1 border-b border-divider py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              {/* 리전 선택 */}
              <button
                type="button"
                className="px-4 py-3 bg-surface-4 hover:bg-surface-8 rounded-l-lg border border-divider border-r-0 font-medium text-sm text-on-surface min-w-[80px]"
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
                  className="w-full px-4 py-3 pr-12 bg-surface-4 border border-divider text-on-surface placeholder-on-surface-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-disabled text-xs">
                  Game name + #{region}1
                </div>
              </div>

              {/* 검색 버튼 */}
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-on-surface rounded-r-lg flex items-center justify-center"
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

