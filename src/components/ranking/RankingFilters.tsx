"use client";

import { useTierCutoffs } from "@/hooks/useRanking";
import { AVAILABLE_REGIONS, type RegionValue } from "@/stores/useRegionStore";
import { ChevronDown } from "lucide-react";
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
      <div className="grid grid-cols-3 gap-4">
        {/* 1섹션: 지역, 랭킹 타입 */}
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

        {/* 2섹션: 비워둠 */}
        <div></div>

        {/* 3섹션: 챌린저/그랜드마스터 정보 */}
        <div className="flex gap-3 justify-end">
          {isLoading ? (
            <>
              <div className="bg-surface-8 rounded-md p-3 w-40 animate-pulse">
                <div className="h-4 bg-surface-12 rounded w-16 mb-2"></div>
                <div className="h-4 bg-surface-12 rounded w-24 mb-1"></div>
                <div className="h-4 bg-surface-12 rounded w-20"></div>
              </div>
              <div className="bg-surface-8 rounded-md p-3 w-40 animate-pulse">
                <div className="h-4 bg-surface-12 rounded w-20 mb-2"></div>
                <div className="h-4 bg-surface-12 rounded w-24 mb-1"></div>
                <div className="h-4 bg-surface-12 rounded w-20"></div>
              </div>
            </>
          ) : isError ? (
            <div className="bg-surface-8 rounded-md p-3 text-sm text-on-surface-medium">
              커트라인 정보를 불러올 수 없습니다
            </div>
          ) : (
            <>
              <div className="bg-surface-8 rounded-md p-3 w-40">
                <div className="text-xs text-on-surface-medium mb-1">챌린저</div>
                <div className="text-sm text-on-surface">
                  커트라인:{" "}
                  <span className="font-semibold text-on-surface">
                    {challengerData?.minLeaguePoints ?? "-"} LP
                  </span>
                </div>
                {challengerData?.players !== undefined && (
                  <div className="text-sm text-on-surface">
                    인원:{" "}
                    <span className="font-semibold text-on-surface">
                      {challengerData.players}명
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-surface-8 rounded-md p-3 w-40">
                <div className="text-xs text-on-surface-medium mb-1">그랜드마스터</div>
                <div className="text-sm text-on-surface">
                  커트라인:{" "}
                  <span className="font-semibold text-on-surface">
                    {grandmasterData?.minLeaguePoints ?? "-"} LP
                  </span>
                </div>
                {grandmasterData?.players !== undefined && (
                  <div className="text-sm text-on-surface">
                    인원:{" "}
                    <span className="font-semibold text-on-surface">
                      {grandmasterData.players}명
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

