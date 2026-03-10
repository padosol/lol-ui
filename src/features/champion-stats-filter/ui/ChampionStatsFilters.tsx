"use client";

import { AVAILABLE_REGIONS } from "@/features/region-select";
import { useSeasonStore } from "@/entities/season";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const TIER_OPTIONS = [
  { value: "CHALLENGER", label: "챌린저" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "MASTER", label: "마스터" },
] as const;

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

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* 티어 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-on-surface-medium">티어</span>
        <div ref={tierRef} className="relative">
          <button
            type="button"
            onClick={() => setTierOpen((v) => !v)}
            className="bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-on-surface cursor-pointer focus:outline-none min-w-[130px] text-left"
            aria-haspopup="listbox"
            aria-expanded={tierOpen}
          >
            {TIER_OPTIONS.find((o) => o.value === selectedTier)?.label ?? selectedTier}
            <ChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${tierOpen ? "rotate-180" : ""}`}
            />
          </button>
          {tierOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1 max-h-[320px] overflow-y-auto" role="listbox" aria-label="티어 선택">
                {TIER_OPTIONS.map((opt) => {
                  const selected = opt.value === selectedTier;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onTierChange(opt.value);
                        setTierOpen(false);
                      }}
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
      </div>

      {/* 패치 */}
      {latestPatches.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-medium">패치</span>
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
        </div>
      )}

      {/* 플랫폼 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-on-surface-medium">플랫폼</span>
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
    </div>
  );
}
