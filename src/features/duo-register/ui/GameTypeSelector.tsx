"use client";

import type { GameType } from "@/entities/duo";
import { GAME_TYPE_LABELS } from "@/entities/duo";

interface GameTypeSelectorProps {
  value: GameType | "";
  onChange: (value: GameType) => void;
  error?: string;
}

const GAME_TYPES: GameType[] = ["SOLO_RANK", "FLEX_RANK", "NORMAL", "ARAM"];

export default function GameTypeSelector({ value, onChange, error }: GameTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-medium mb-2">
        게임 종류 <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {GAME_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              value === type
                ? "bg-primary text-on-surface"
                : "bg-surface-4 hover:bg-surface-8 border border-divider text-on-surface-medium"
            }`}
          >
            {GAME_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
