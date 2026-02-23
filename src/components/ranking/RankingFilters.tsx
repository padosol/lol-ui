"use client";

import { useTierCutoffs } from "@/hooks/useRanking";
import { AVAILABLE_REGIONS, type RegionValue } from "@/stores/useRegionStore";
import { getTierColor, getTierImageUrl } from "@/utils/tier";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface RankingFiltersProps {
  region: RegionValue;
  queueType: string;
  onRegionChange: (region: RegionValue) => void;
  onQueueTypeChange: (queueType: string) => void;
}

const queueTypes = [
  { value: "solo", label: "솔로랭크" },
  { value: "flex", label: "자유랭크" },
];

// queueType을 API queue 파라미터로 변환
const getQueueParam = (
  queueType: string
): "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" => {
  return queueType === "flex" ? "RANKED_FLEX_SR" : "RANKED_SOLO_5x5";
};

// LP 변동 표시 헬퍼 함수
const getLpChangeDisplay = (lpChange: number | undefined) => {
  if (lpChange === undefined) return null;

  if (lpChange === 0) {
    return <span className="text-on-surface-medium text-xs ml-1">-</span>;
  }

  if (lpChange > 0) {
    return (
      <span className="flex items-center text-win text-xs ml-1">
        <ChevronUp className="w-3 h-3" />
        {lpChange}
      </span>
    );
  }
  return (
    <span className="flex items-center text-lose text-xs ml-1">
      <ChevronDown className="w-3 h-3" />
      {Math.abs(lpChange)}
    </span>
  );
};

export default function RankingFilters({
  region,
  queueType,
  onRegionChange,
  onQueueTypeChange,
}: RankingFiltersProps) {
  const queueParam = getQueueParam(queueType);
  const { data: tierCutoffs, isLoading, isError } = useTierCutoffs(region, queueParam);

  // API 응답에서 챌린저/그랜드마스터 데이터 추출
  const challengerData = tierCutoffs?.find((t) => t.tier === "CHALLENGER");
  const grandmasterData = tierCutoffs?.find((t) => t.tier === "GRANDMASTER");
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isQueueTypeOpen, setIsQueueTypeOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const queueTypeRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        regionRef.current &&
        !regionRef.current.contains(event.target as Node)
      ) {
        setIsRegionOpen(false);
      }
      if (
        queueTypeRef.current &&
        !queueTypeRef.current.contains(event.target as Node)
      ) {
        setIsQueueTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedRegion = AVAILABLE_REGIONS.find((r) => r.value === region);
  const selectedQueueTypeLabel =
    queueTypes.find((q) => q.value === queueType)?.label ?? queueType;

  return (
    <div className="bg-surface-4 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* 필터 섹션: 지역, 랭킹 타입 */}
        <div className="flex gap-4">
          <div className="w-32">
            <label className="block text-sm font-medium text-on-surface mb-2">
              지역
            </label>
            <div ref={regionRef} className="relative">
              <button
                type="button"
                onClick={() => setIsRegionOpen((v) => !v)}
                className="w-full bg-surface-8 text-on-surface border border-divider rounded-md px-3 py-2 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-haspopup="listbox"
                aria-expanded={isRegionOpen}
              >
                <span className="text-sm">
                  {selectedRegion?.label ?? region}{" "}
                  <span className="text-on-surface-medium">
                    {selectedRegion?.subLabel}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-medium transition-transform ${
                    isRegionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="py-1" role="listbox" aria-label="지역 선택">
                    {AVAILABLE_REGIONS.map((r) => {
                      const selected = r.value === region;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            onRegionChange(r.value);
                            setIsRegionOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                            selected
                              ? "bg-surface-8 text-on-surface"
                              : "text-on-surface hover:bg-surface-8"
                          }`}
                          role="option"
                          aria-selected={selected}
                        >
                          {r.label}{" "}
                          <span className="text-on-surface-medium">
                            {r.subLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-on-surface mb-2">
              랭킹 타입
            </label>
            <div ref={queueTypeRef} className="relative">
              <button
                type="button"
                onClick={() => setIsQueueTypeOpen((v) => !v)}
                className="w-full bg-surface-8 text-on-surface border border-divider rounded-md px-3 py-2 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-haspopup="listbox"
                aria-expanded={isQueueTypeOpen}
              >
                <span className="text-sm">{selectedQueueTypeLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-medium transition-transform ${
                    isQueueTypeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isQueueTypeOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="py-1" role="listbox" aria-label="랭킹 타입 선택">
                    {queueTypes.map((q) => {
                      const selected = q.value === queueType;
                      return (
                        <button
                          key={q.value}
                          type="button"
                          onClick={() => {
                            onQueueTypeChange(q.value);
                            setIsQueueTypeOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                            selected
                              ? "bg-surface-8 text-on-surface"
                              : "text-on-surface hover:bg-surface-8"
                          }`}
                          role="option"
                          aria-selected={selected}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 커트라인 카드 섹션 */}
        <div className="flex gap-3">
          {isLoading ? (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-8 border border-divider rounded-lg overflow-hidden animate-pulse">
                  <div className="h-0.5 bg-surface-12" />
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-12 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-surface-12 rounded w-16" />
                      <div className="h-4 bg-surface-12 rounded w-14" />
                      <div className="h-3 bg-surface-12 rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : isError ? (
            <div className="bg-surface-8 rounded-lg p-3 text-sm text-on-surface-medium">
              커트라인 정보를 불러올 수 없습니다
            </div>
          ) : (
            <>
              {[
                { tier: "CHALLENGER", label: "챌린저", data: challengerData },
                { tier: "GRANDMASTER", label: "그랜드마스터", data: grandmasterData },
              ].map(({ tier, label, data }) => (
                <div
                  key={tier}
                  className="bg-surface-8 border border-divider rounded-lg overflow-hidden"
                >
                  <div className={`h-0.5 bg-gradient-to-r ${getTierColor(tier)}`} />
                  <div className="p-3 flex items-center gap-3">
                    <Image
                      src={getTierImageUrl(tier)}
                      alt={label}
                      width={40}
                      height={40}
                      className="shrink-0"
                    />
                    <div>
                      <div className="text-xs text-on-surface-medium">{label}</div>
                      <div className="flex items-center">
                        <span className="text-base font-bold text-on-surface">
                          {data?.minLeaguePoints ?? "-"}
                        </span>
                        <span className="text-xs text-on-surface-medium ml-1">LP</span>
                        {getLpChangeDisplay(data?.lpChange)}
                      </div>
                      {data?.userCount !== undefined && (
                        <div className="text-xs text-on-surface-medium">
                          {data.userCount.toLocaleString()}명
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

