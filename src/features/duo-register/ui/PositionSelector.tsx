"use client";

import type { DuoPosition } from "@/entities/duo";
import { getPositionImageUrl, getPositionName } from "@/shared/lib/position";
import Image from "next/image";

interface PositionSelectorProps {
  value: DuoPosition | "";
  onChange: (value: DuoPosition) => void;
  error?: string;
}

const POSITIONS: DuoPosition[] = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

export default function PositionSelector({ value, onChange, error }: PositionSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-medium mb-2">
        포지션 <span className="text-red-400">*</span>
      </label>
      <div className="flex gap-2">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors ${
              value === pos
                ? "bg-primary text-on-surface"
                : "bg-surface-4 hover:bg-surface-8 border border-divider text-on-surface-medium"
            }`}
          >
            <Image
              src={getPositionImageUrl(pos)}
              alt={getPositionName(pos)}
              width={24}
              height={24}
              className={value === pos ? "brightness-200" : "opacity-70"}
            />
            <span className="text-xs">{getPositionName(pos)}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
