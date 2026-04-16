"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { Lane, Tier } from "@/entities/duo";
import { LANES, LANE_LABELS, LANE_IMAGE_KEY, TIERS } from "@/entities/duo";
import { getPositionImageUrl } from "@/shared/lib/position";
import { getTierName } from "@/shared/lib/tier";

interface DuoFiltersProps {
  lane: Lane | "ALL";
  tier: Tier | "ALL";
  onLaneChange: (value: Lane | "ALL") => void;
  onTierChange: (value: Tier | "ALL") => void;
}

export default function DuoFilters({
  lane,
  tier,
  onLaneChange,
  onTierChange,
}: DuoFiltersProps) {
  const [tierOpen, setTierOpen] = useState(false);
  const tierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tierRef.current && !tierRef.current.contains(e.target as Node)) {
        setTierOpen(false);
      }
    }
    if (tierOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [tierOpen]);

  const tierLabel = tier === "ALL" ? "전체 티어" : getTierName(tier);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Lane 필터 */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onLaneChange("ALL")}
          className={`cursor-pointer px-3 py-1.5 rounded-md text-sm transition-colors ${
            lane === "ALL"
              ? "bg-primary text-on-primary"
              : "bg-surface-4 text-on-surface-medium hover:bg-surface-8"
          }`}
        >
          전체
        </button>
        {LANES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onLaneChange(l)}
            className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              lane === l
                ? "bg-primary text-on-primary"
                : "bg-surface-4 text-on-surface-medium hover:bg-surface-8"
            }`}
          >
            <Image
              src={getPositionImageUrl(LANE_IMAGE_KEY[l])}
              alt={LANE_LABELS[l]}
              width={14}
              height={14}
              className={lane === l ? "brightness-200" : "opacity-70"}
            />
            <span className="hidden sm:inline">{LANE_LABELS[l]}</span>
          </button>
        ))}
      </div>

      {/* Tier 필터 — 커스텀 드롭다운 */}
      <div ref={tierRef} className="relative">
        <button
          type="button"
          onClick={() => setTierOpen((v) => !v)}
          className="cursor-pointer flex items-center gap-2 bg-surface-4 border border-divider rounded-md px-3 py-1.5 text-sm text-on-surface hover:border-primary transition-colors"
        >
          {tierLabel}
          <ChevronDown
            className={`w-4 h-4 text-on-surface-medium transition-transform ${tierOpen ? "rotate-180" : ""}`}
          />
        </button>

        {tierOpen && (
          <div className="absolute z-50 mt-1 w-40 bg-surface-2 border border-divider rounded-md shadow-lg py-1 max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                onTierChange("ALL");
                setTierOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                tier === "ALL"
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-medium hover:bg-surface-8"
              }`}
            >
              전체 티어
            </div>
            {TIERS.map((t) => (
              <div
                key={t}
                onClick={() => {
                  onTierChange(t);
                  setTierOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                  tier === t
                    ? "bg-primary/20 text-primary"
                    : "text-on-surface-medium hover:bg-surface-8"
                }`}
              >
                {getTierName(t)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
