"use client";

import Image from "next/image";
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
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Lane 필터 */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onLaneChange("ALL")}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
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
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
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

      {/* Tier 필터 */}
      <select
        value={tier}
        onChange={(e) => onTierChange(e.target.value as Tier | "ALL")}
        className="bg-surface-4 border border-divider rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary"
      >
        <option value="ALL">전체 티어</option>
        {TIERS.map((t) => (
          <option key={t} value={t}>
            {getTierName(t)}
          </option>
        ))}
      </select>
    </div>
  );
}
