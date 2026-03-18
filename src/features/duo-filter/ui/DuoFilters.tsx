"use client";

import type { GameType, DuoPosition } from "@/entities/duo";
import { GAME_TYPE_LABELS, DUO_POSITION_LABELS } from "@/entities/duo";

interface DuoFiltersProps {
  gameType: GameType | "ALL";
  position: DuoPosition | "ALL";
  onGameTypeChange: (value: GameType | "ALL") => void;
  onPositionChange: (value: DuoPosition | "ALL") => void;
}

const GAME_TYPE_OPTIONS: { value: GameType | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  ...Object.entries(GAME_TYPE_LABELS).map(([value, label]) => ({
    value: value as GameType,
    label,
  })),
];

const POSITION_OPTIONS: { value: DuoPosition | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  ...Object.entries(DUO_POSITION_LABELS).map(([value, label]) => ({
    value: value as DuoPosition,
    label,
  })),
];

export default function DuoFilters({
  gameType,
  position,
  onGameTypeChange,
  onPositionChange,
}: DuoFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={gameType}
        onChange={(e) => onGameTypeChange(e.target.value as GameType | "ALL")}
        className="bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
      >
        {GAME_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={position}
        onChange={(e) => onPositionChange(e.target.value as DuoPosition | "ALL")}
        className="bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
      >
        {POSITION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
