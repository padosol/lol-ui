"use client";

import Image from "next/image";
import { LANES, LANE_LABELS, LANE_IMAGE_KEY } from "@/entities/duo";
import type { Lane } from "@/entities/duo";
import { getPositionImageUrl } from "@/shared/lib/position";

interface LaneSelectorProps {
  label: string;
  value: Lane | "";
  onChange: (lane: Lane) => void;
  error?: string;
}

export default function LaneSelector({
  label,
  value,
  onChange,
  error,
}: LaneSelectorProps) {
  return (
    <div>
      <label className="block text-sm text-on-surface-medium mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {LANES.map((lane) => {
          const isSelected = value === lane;
          return (
            <button
              key={lane}
              type="button"
              onClick={() => onChange(lane)}
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-4 text-on-surface-medium hover:bg-surface-8"
              }`}
            >
              <Image
                src={getPositionImageUrl(LANE_IMAGE_KEY[lane])}
                alt={LANE_LABELS[lane]}
                width={16}
                height={16}
                className={isSelected ? "brightness-200" : "opacity-70"}
              />
              <span>{LANE_LABELS[lane]}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
