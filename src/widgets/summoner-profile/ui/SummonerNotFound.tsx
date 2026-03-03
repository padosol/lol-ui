"use client";

import { searchSummonerAutocomplete } from "@/entities/summoner";
import { useRegionStore, AVAILABLE_REGIONS, type RegionValue } from "@/features/region-select";
import type { SummonerAutocompleteItem } from "@/entities/summoner";
import { getProfileIconImageUrl } from "@/shared/lib/profile";
import { getTierColor, getTierImageUrl, getTierInitial } from "@/shared/lib/tier";
import { ChevronDown, Home, Search, UserX } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SummonerNotFoundProps {
  summonerName: string;
  tagline?: string;
  region?: string;
}

export default function SummonerNotFound({
  summonerName,
  tagline,
  region: initialRegion,
}: SummonerNotFoundProps) {
  const router = useRouter();
  const { region: storeRegion, setRegion } = useRegionStore();
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    SummonerAutocompleteItem[]
  >([]);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  // 초기 region 설정 (URL에서 받은 region이 있으면 스토어 업데이트)
  useEffect(() => {
    if (initialRegion && AVAILABLE_REGIONS.some(r => r.value === initialRegion)) {
      setRegion(initialRegion as RegionValue);
    }
  }, [initialRegion, setRegion]);

  const currentRegion = storeRegion;

  // 디바운스를 위한 useEffect
  useEffect(() => {
    const trimmedName = searchQuery.trim();

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
          currentRegion
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
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentRegion]);

  // 외부 클릭 시 드롭다운 닫기
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
    const trimmedName = searchQuery.trim();
    if (trimmedName) {
      const encodedName = encodeURIComponent(trimmedName);
      router.push(`/summoners/${currentRegion}/${encodedName}`);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (item: SummonerAutocompleteItem) => {
    const gameName = item.tagLine
      ? `${item.gameName}-${item.tagLine}`
      : item.gameName;
    const encodedName = encodeURIComponent(gameName);
    router.push(`/summoners/${currentRegion}/${encodedName}`);
    setShowAutocomplete(false);
    setSearchQuery(gameName);
  };

  const displayName = tagline ? `${summonerName}#${tagline}` : summonerName;

  return (
    <div className="flex items-start justify-center pt-16 pb-8">
      <div className="text-center px-4 w-full max-w-2xl animate-fade-in-up">
        {/* 비주얼 영역 - 소환 실패 아이콘 */}
        <div className="relative mb-8">
          {/* 배경 글로우 효과 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-full animate-pulse-glow"
              style={{
                background: "radial-gradient(circle, var(--md-primary) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* 메인 아이콘 */}
          <div className="relative animate-float">
            <div className="w-28 h-28 mx-auto bg-surface-4 rounded-full flex items-center justify-center border-2 border-primary/30 shadow-lg">
              <UserX className="w-14 h-14 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">
            소환사를 찾을 수 없습니다
          </h1>
          <p className="text-on-surface-medium text-base mb-2">
            <span className="text-primary font-medium">&quot;{displayName}&quot;</span> 소환사가
          </p>
          <p className="text-on-surface-medium text-base">
            소환사의 협곡에서 발견되지 않았습니다.
          </p>
        </div>

        {/* 검색 영역 */}
        <div className="w-full mb-8">
          <p className="text-on-surface-disabled text-sm mb-4">
            다른 소환사를 검색해보세요
          </p>
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
                    {AVAILABLE_REGIONS.find((o) => o.value === currentRegion)?.label ??
                      currentRegion}
                  </span>
                  <span className="text-[10px] text-on-surface-medium">
                    {AVAILABLE_REGIONS.find((o) => o.value === currentRegion)
                      ?.subLabel ?? currentRegion}
                  </span>
                </span>
                <ChevronDown
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${
                    isRegionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="py-1" role="listbox" aria-label="리전 선택">
                    {AVAILABLE_REGIONS.map((opt) => {
                      const selected = opt.value === currentRegion;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setRegion(opt.value);
                            setIsRegionOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                            selected
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-disabled text-xs hidden sm:block">
                Game name + #{currentRegion.toUpperCase()}1
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
                            {/* 프로필 아이콘 */}
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

                            {/* 기본 정보 */}
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

                            {/* 티어 정보 */}
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
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-on-surface rounded-r-lg flex items-center justify-center border border-l-0 border-primary h-full cursor-pointer transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* 안내 메시지 */}
        <div className="mb-8 text-on-surface-disabled text-sm space-y-1">
          <p>• 소환사명과 태그라인을 정확히 입력해주세요</p>
          <p>• 예시: HideOnBush#KR1</p>
        </div>

        {/* 홈으로 돌아가기 버튼 */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-surface-4 hover:bg-surface-6 cursor-pointer text-on-surface rounded-lg font-medium transition-colors border border-divider"
        >
          <Home className="w-5 h-5" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
