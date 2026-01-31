"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface RankingFiltersProps {
  region: string;
  queueType: string;
  onRegionChange: (region: string) => void;
  onQueueTypeChange: (queueType: string) => void;
}

const regions = [
  { value: "kr", label: "한국" },
  { value: "na", label: "북미" },
  { value: "euw", label: "유럽 서부" },
  { value: "eune", label: "유럽 동북" },
  { value: "jp", label: "일본" },
];

const queueTypes = [
  { value: "solo", label: "솔로랭크" },
  { value: "flex", label: "자유랭크" },
];

// 더미 데이터 - 실제 데이터로 교체 필요
const getTierInfo = (region: string, queueType: string) => {
  return {
    challenger: {
      cutoff: 1200,
      players: 300,
    },
    grandmaster: {
      cutoff: 1000,
      players: 1000,
    },
  };
};

export default function RankingFilters({
  region,
  queueType,
  onRegionChange,
  onQueueTypeChange,
}: RankingFiltersProps) {
  const tierInfo = getTierInfo(region, queueType);
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

  const selectedRegionLabel =
    regions.find((r) => r.value === region)?.label ?? region;
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
                <span className="text-sm">{selectedRegionLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-medium transition-transform ${
                    isRegionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="py-1" role="listbox" aria-label="지역 선택">
                    {regions.map((r) => {
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
                          {r.label}
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
          <div className="bg-surface-8 rounded-md p-3 w-40">
            <div className="text-xs text-on-surface-medium mb-1">챌린저</div>
            <div className="text-sm text-on-surface">
              커트라인: <span className="font-semibold text-on-surface">{tierInfo.challenger.cutoff} LP</span>
            </div>
            <div className="text-sm text-on-surface">
              인원: <span className="font-semibold text-on-surface">{tierInfo.challenger.players}명</span>
            </div>
          </div>
          <div className="bg-surface-8 rounded-md p-3 w-40">
            <div className="text-xs text-on-surface-medium mb-1">그랜드마스터</div>
            <div className="text-sm text-on-surface">
              커트라인: <span className="font-semibold text-on-surface">{tierInfo.grandmaster.cutoff} LP</span>
            </div>
            <div className="text-sm text-on-surface">
              인원: <span className="font-semibold text-on-surface">{tierInfo.grandmaster.players}명</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

