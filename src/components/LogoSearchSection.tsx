"use client";

import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { normalizeRegion } from "@/utils/summoner";
import { searchSummonerAutocomplete } from "@/lib/api/summoner";
import type { SummonerAutocompleteItem } from "@/types/api";
import Image from "next/image";
import { getProfileIconImageUrl } from "@/utils/profile";
import { getTierImageUrl, getTierColor, getTierInitial } from "@/utils/tier";

export default function LogoSearchSection() {
  const router = useRouter();
  const [region, setRegion] = useState("KR");
  const [summonerName, setSummonerName] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<SummonerAutocompleteItem[]>([]);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 디바운스를 위한 useEffect
  useEffect(() => {
    const trimmedName = summonerName.trim();
    
    if (trimmedName.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoadingAutocomplete(true);
      try {
        const normalizedRegion = normalizeRegion(region);
        const results = await searchSummonerAutocomplete(trimmedName, normalizedRegion);
        setAutocompleteResults(results);
        setShowAutocomplete(results.length > 0);
      } catch (error) {
        console.error("자동완성 검색 오류:", error);
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      } finally {
        setIsLoadingAutocomplete(false);
      }
    }, 200); // 0.2초 디바운스

    return () => clearTimeout(debounceTimer);
  }, [summonerName, region]);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = summonerName.trim();
    if (trimmedName) {
      // 입력값을 URL 인코딩하여 소환사 상세 페이지로 이동
      const encodedName = encodeURIComponent(trimmedName);
      const normalizedRegion = normalizeRegion(region);
      router.push(`/summoners/${normalizedRegion}/${encodedName}`);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (item: SummonerAutocompleteItem) => {
    const gameName = item.tagLine ? `${item.gameName}-${item.tagLine}` : item.gameName;
    const encodedName = encodeURIComponent(gameName);
    const normalizedRegion = normalizeRegion(region);
    router.push(`/summoners/${normalizedRegion}/${encodedName}`);
    setShowAutocomplete(false);
    setSummonerName(gameName);
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
                  ref={inputRef}
                  type="text"
                  value={summonerName}
                  onChange={(e) => {
                    setSummonerName(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setShowAutocomplete(true);
                    }
                  }}
                  onFocus={() => {
                    if (autocompleteResults.length > 0) {
                      setShowAutocomplete(true);
                    }
                  }}
                  placeholder="Game name + #KR1"
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 border-l-0 border-r-0 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-full"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                  Game name + #{region}1
                </div>
                
                {/* 자동완성 드롭다운 */}
                {showAutocomplete && (
                  <div
                    ref={autocompleteRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {isLoadingAutocomplete ? (
                      <div className="p-4 text-center text-gray-400">
                        검색 중...
                      </div>
                    ) : autocompleteResults.length > 0 ? (
                      <div className="py-1">
                        {autocompleteResults.map((item, index) => {
                          const uniqueKey = item.tagLine 
                            ? `${item.gameName}-${item.tagLine}-${index}`
                            : `${item.gameName}-${index}`;
                          return (
                            <button
                              key={uniqueKey}
                              onClick={() => handleAutocompleteSelect(item)}
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-700 transition-colors text-left cursor-pointer"
                            >
                              {/* 1. 프로필 아이콘 */}
                              <div className="w-8 h-8 bg-gray-700 rounded-lg overflow-hidden relative flex-shrink-0">
                                {item.profileIconId ? (
                                  <Image
                                    src={getProfileIconImageUrl(item.profileIconId)}
                                    alt="Profile Icon"
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <span className="text-lg flex items-center justify-center w-full h-full">
                                    👤
                                  </span>
                                )}
                              </div>

                              {/* 2. 기본 정보 */}
                              <div className="flex-1 min-w-0 flex flex-row items-center gap-2">
                                <div className="text-white font-medium text-sm truncate">
                                  {item.gameName}
                                  {item.tagLine && (
                                    <span className="text-gray-400 ml-1">
                                      #{item.tagLine}
                                    </span>
                                  )}
                                </div>
                                {item.summonerLevel && (
                                  <div className="text-gray-400 text-xs">
                                    레벨 {item.summonerLevel}
                                  </div>
                                )}
                              </div>

                              {/* 3. 티어 정보 */}
                              {item.tier && item.rank && (
                                <div className="flex flex-row items-center gap-2 flex-shrink-0">
                                  <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden relative">
                                    {getTierImageUrl(item.tier) ? (
                                      <Image
                                        src={getTierImageUrl(item.tier)}
                                        alt={`${item.tier} 티어`}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                        unoptimized
                                      />
                                    ) : (
                                      <div
                                        className={`w-full h-full bg-gradient-to-br ${getTierColor(
                                          item.tier
                                        )} flex items-center justify-center`}
                                      >
                                        <span className="text-white text-xs font-bold">
                                          {getTierInitial(item.tier)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-row items-center gap-2">
                                    <div className="text-white text-xs font-semibold">
                                      {item.tier} {item.rank}
                                    </div>
                                    {item.leaguePoints !== null && (
                                      <div className="text-gray-400 text-xs">
                                        {item.leaguePoints}LP
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                )}
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
