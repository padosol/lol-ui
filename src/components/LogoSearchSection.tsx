"use client";

import { searchSummonerAutocomplete } from "@/lib/api/summoner";
import { AVAILABLE_REGIONS, useRegionStore } from "@/stores/useRegionStore";
import type { SummonerAutocompleteItem } from "@/types/api";
import { getProfileIconImageUrl } from "@/utils/profile";
import { getTierColor, getTierImageUrl, getTierInitial } from "@/utils/tier";
import { ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LogoSearchSection() {
  const router = useRouter();
  const { region, setRegion } = useRegionStore();
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [summonerName, setSummonerName] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    SummonerAutocompleteItem[]
  >([]);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

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
        const results = await searchSummonerAutocomplete(
          trimmedName,
          region
        );
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
        !inputRef.current.contains(event.target as Node) &&
        regionRef.current &&
        !regionRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }

      if (
        regionRef.current &&
        !regionRef.current.contains(event.target as Node)
      ) {
        setIsRegionOpen(false);
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
      router.push(`/summoners/${region}/${encodedName}`);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (item: SummonerAutocompleteItem) => {
    const gameName = item.tagLine
      ? `${item.gameName}-${item.tagLine}`
      : item.gameName;
    const encodedName = encodeURIComponent(gameName);
    router.push(`/summoners/${region}/${encodedName}`);
    setShowAutocomplete(false);
    setSummonerName(gameName);
  };

  return (
    <section className="bg-surface-1 border-b border-divider py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">
          {/* 로고 영역 - 이미지가 들어갈 공간 */}
          <div className="flex items-center justify-center">
            <div className="w-64 h-32 flex items-center justify-center">
              {/* 추후 이미지로 교체될 공간 */}
              <h1 className="text-3xl font-bold text-primary">METAPICK</h1>
            </div>
          </div>

          {/* 검색 영역 */}
          <div className="w-full max-w-2xl -mt-4">
            <form onSubmit={handleSearch} className="flex gap-0 items-stretch">
              {/* 리전 선택 */}
              <div ref={regionRef} className="relative flex">
                <button
                  type="button"
                  onClick={() => setIsRegionOpen((v) => !v)}
                  className="relative px-3 py-2.5 pr-10 bg-surface-4 hover:bg-surface-8 rounded-l-lg border border-r border-divider font-medium text-sm text-on-surface min-w-[96px] cursor-pointer focus:outline-none h-full flex items-center gap-2"
                  aria-haspopup="listbox"
                  aria-expanded={isRegionOpen}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-on-surface">
                      {AVAILABLE_REGIONS.find((o) => o.value === region)?.label ??
                        region}
                    </span>
                    <span className="text-[10px] text-on-surface-medium">
                      {AVAILABLE_REGIONS.find((o) => o.value === region)
                        ?.subLabel ?? region}
                    </span>
                  </span>
                  <ChevronDown
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${isRegionOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isRegionOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1" role="listbox" aria-label="리전 선택">
                      {AVAILABLE_REGIONS.map((opt) => {
                        const selected = opt.value === region;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setRegion(opt.value);
                              setIsRegionOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors cursor-pointer ${selected
                              ? "bg-surface-8 text-on-surface"
                              : "text-on-surface hover:bg-surface-8"
                              }`}
                            role="option"
                            aria-selected={selected}
                          >
                            <span className="font-medium text-sm">
                              {opt.label}
                            </span>
                            <span className="text-xs text-on-surface-medium">
                              {opt.subLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                  className="w-full px-4 py-3 pr-12 bg-surface-4 border border-divider border-l-0 border-r-0 text-on-surface placeholder-on-surface-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-full"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-disabled text-xs">
                  Game name + #{region.toUpperCase()}1
                </div>

                {/* 자동완성 드롭다운 */}
                {showAutocomplete && (
                  <div
                    ref={autocompleteRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-surface-4 border border-divider rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {isLoadingAutocomplete ? (
                      <div className="p-4 text-center text-on-surface-medium">
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
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-surface-8 transition-colors text-left cursor-pointer"
                            >
                              {/* 1. 프로필 아이콘 */}
                              <div className="w-8 h-8 bg-surface-8 rounded-lg overflow-hidden relative shrink-0">
                                {item.profileIconId ? (
                                  <Image
                                    src={getProfileIconImageUrl(
                                      item.profileIconId
                                    )}
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
                                <div className="text-on-surface font-medium text-sm truncate">
                                  {item.gameName}
                                  {item.tagLine && (
                                    <span className="text-on-surface-medium ml-1">
                                      #{item.tagLine}
                                    </span>
                                  )}
                                </div>
                                {item.summonerLevel && (
                                  <div className="text-on-surface-medium text-xs">
                                    레벨 {item.summonerLevel}
                                  </div>
                                )}
                              </div>

                              {/* 3. 티어 정보 */}
                              {item.tier && item.rank && (
                                <div className="flex flex-row items-center gap-2 shrink-0">
                                  <div className="w-10 h-10 bg-surface-4 rounded-lg overflow-hidden relative">
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
                                        className={`w-full h-full bg-linear-to-br ${getTierColor(
                                          item.tier
                                        )} flex items-center justify-center`}
                                      >
                                        <span className="text-on-surface text-xs font-bold">
                                          {getTierInitial(item.tier)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-row items-center gap-2">
                                    <div className="text-on-surface text-xs font-semibold">
                                      {item.tier} {item.rank}
                                    </div>
                                    {item.leaguePoints !== null && (
                                      <div className="text-on-surface-medium text-xs">
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
                      <div className="p-4 text-center text-on-surface-medium">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 검색 버튼 */}
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-on-surface rounded-r-lg flex items-center justify-center border border-l-0 border-primary h-full"
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
