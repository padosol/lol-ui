"use client";

import { AVAILABLE_REGIONS } from "@/features/region-select";
import { useSeasonStore } from "@/entities/season";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const TIER_OPTIONS = [
  { value: "CHALLENGER", label: "챌린저" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "MASTER", label: "마스터" },
  { value: "DIAMOND", label: "다이아몬드" },
  { value: "EMERALD", label: "에메랄드" },
  { value: "PLATINUM", label: "플래티넘" },
  { value: "GOLD", label: "골드" },
  { value: "SILVER", label: "실버" },
  { value: "BRONZE", label: "브론즈" },
  { value: "IRON", label: "아이언" },
] as const;

// CHALLENGER는 최상위라 "+ 누적"이 의미 없고 BE가 INVALID_TIER_FILTER 400을 반환
const CUMULATIVE_DISALLOWED = "CHALLENGER";

interface ChampionStatsFiltersProps {
  selectedTier: string;
  onTierChange: (tier: string) => void;
  selectedPatch: string;
  onPatchChange: (patch: string) => void;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
}

export default function ChampionStatsFilters({
  selectedTier,
  onTierChange,
  selectedPatch,
  onPatchChange,
  selectedPlatform,
  onPlatformChange,
}: ChampionStatsFiltersProps) {
  const [tierOpen, setTierOpen] = useState(false);
  const [patchOpen, setPatchOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const tierRef = useRef<HTMLDivElement>(null);
  const patchRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  const isCumulative = selectedTier.endsWith("+");
  const baseTier = isCumulative ? selectedTier.slice(0, -1) : selectedTier;
  const cumulativeDisabled = baseTier === CUMULATIVE_DISALLOWED;
  const baseTierLabel =
    TIER_OPTIONS.find((o) => o.value === baseTier)?.label ?? baseTier;
  const tierDisplayLabel = isCumulative ? `${baseTierLabel}+` : baseTierLabel;

  const latestSeason = useSeasonStore((s) => s.getLatestSeason());
  const latestPatches = latestSeason?.patchVersions ?? [];
  const activePatch = selectedPatch || latestPatches[0] || "";

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (tierRef.current && !tierRef.current.contains(e.target as Node)) {
      setTierOpen(false);
    }
    if (patchRef.current && !patchRef.current.contains(e.target as Node)) {
      setPatchOpen(false);
    }
    if (platformRef.current && !platformRef.current.contains(e.target as Node)) {
      setPlatformOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleTierSelect = (value: string) => {
    const next =
      isCumulative && value !== CUMULATIVE_DISALLOWED ? `${value}+` : value;
    onTierChange(next);
    setTierOpen(false);
  };

  const handleCumulativeToggle = () => {
    if (cumulativeDisabled) return;
    onTierChange(isCumulative ? baseTier : `${baseTier}+`);
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* 티어 */}
      <div ref={tierRef} className="relative">
        <button
          type="button"
          onClick={() => setTierOpen((v) => !v)}
          className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[130px] text-left"
          aria-haspopup="listbox"
          aria-expanded={tierOpen}
        >
          {tierDisplayLabel}
          <ChevronDown
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${tierOpen ? "rotate-180" : ""}`}
          />
        </button>
        {tierOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="py-1 max-h-[320px] overflow-y-auto" role="listbox" aria-label="티어 선택">
              {TIER_OPTIONS.map((opt) => {
                const selected = opt.value === baseTier;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTierSelect(opt.value)}
                    className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                      selected
                        ? "bg-surface-8 text-on-surface font-medium"
                        : "text-on-surface hover:bg-surface-8"
                    }`}
                    role="option"
                    aria-selected={selected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 누적(+) 토글: 선택 티어 이상 데이터 합산 */}
      <button
        type="button"
        onClick={handleCumulativeToggle}
        disabled={cumulativeDisabled}
        aria-pressed={isCumulative}
        title={
          cumulativeDisabled
            ? "챌린저는 누적(+) 옵션을 사용할 수 없습니다"
            : "선택 티어 이상 누적"
        }
        className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none transition-colors min-w-[44px] ${
          cumulativeDisabled
            ? "bg-surface-4 border-divider text-on-surface-medium opacity-40 cursor-not-allowed"
            : isCumulative
              ? "bg-primary/15 border-primary text-primary cursor-pointer"
              : "bg-surface-4 border-divider text-on-surface hover:bg-surface-8 cursor-pointer"
        }`}
      >
        +
      </button>

      {/* 패치 */}
      {latestPatches.length > 0 && (
        <div ref={patchRef} className="relative">
          <button
            type="button"
            onClick={() => setPatchOpen((v) => !v)}
            className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[80px] text-left"
            aria-haspopup="listbox"
            aria-expanded={patchOpen}
          >
            {activePatch}
            <ChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${patchOpen ? "rotate-180" : ""}`}
            />
          </button>
          {patchOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1" role="listbox" aria-label="패치 선택">
                {latestPatches.map((patch) => {
                  const selected = patch === activePatch;
                  return (
                    <button
                      key={patch}
                      type="button"
                      onClick={() => {
                        onPatchChange(patch);
                        setPatchOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                        selected
                          ? "bg-surface-8 text-on-surface font-medium"
                          : "text-on-surface hover:bg-surface-8"
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      {patch}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 플랫폼 */}
      <div ref={platformRef} className="relative">
        <button
          type="button"
          onClick={() => setPlatformOpen((v) => !v)}
          className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[80px] text-left"
          aria-haspopup="listbox"
          aria-expanded={platformOpen}
        >
          {AVAILABLE_REGIONS.find((r) => r.value === selectedPlatform)?.subLabel ?? selectedPlatform.toUpperCase()}
          <ChevronDown
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${platformOpen ? "rotate-180" : ""}`}
          />
        </button>
        {platformOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="py-1" role="listbox" aria-label="플랫폼 선택">
              {AVAILABLE_REGIONS.map((region) => {
                const selected = region.value === selectedPlatform;
                return (
                  <button
                    key={region.value}
                    type="button"
                    onClick={() => {
                      onPlatformChange(region.value);
                      setPlatformOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                      selected
                        ? "bg-surface-8 text-on-surface font-medium"
                        : "text-on-surface hover:bg-surface-8"
                    }`}
                    role="option"
                    aria-selected={selected}
                  >
                    {region.label} ({region.subLabel})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
