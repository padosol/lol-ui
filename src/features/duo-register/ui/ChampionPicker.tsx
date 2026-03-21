"use client";

import { useGameDataStore } from "@/shared/model/game-data";
import { getChampionImageUrl } from "@/entities/champion";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { X } from "lucide-react";

interface ChampionPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export default function ChampionPicker({ value, onChange, error }: ChampionPickerProps) {
  const championData = useGameDataStore((s) => s.championData);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const champions = useMemo(() => {
    if (!championData?.data) return [];
    return Object.values(championData.data).sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );
  }, [championData]);

  const filtered = useMemo(() => {
    if (!query.trim()) return champions.slice(0, 8);
    const q = query.toLowerCase();
    return champions
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [champions, query]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const addChampion = (championId: string) => {
    if (value.length >= 3 || value.includes(championId)) return;
    onChange([...value, championId]);
    setQuery("");
    setOpen(false);
  };

  const removeChampion = (championId: string) => {
    onChange(value.filter((id) => id !== championId));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-medium mb-2">
        선호 챔피언 (최대 3개)
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((champId) => {
            const champ = champions.find((c) => c.id === champId);
            return (
              <div
                key={champId}
                className="flex items-center gap-1.5 bg-surface-4 border border-divider rounded-full pl-1 pr-2 py-0.5"
              >
                <Image
                  src={getChampionImageUrl(champId)}
                  alt={champ?.name ?? champId}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-xs text-on-surface">{champ?.name ?? champId}</span>
                <button
                  type="button"
                  onClick={() => removeChampion(champId)}
                  className="text-on-surface-disabled hover:text-on-surface transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {value.length < 3 && (
        <div className="relative" ref={containerRef}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="챔피언 검색..."
            className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary"
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-surface-4 border border-divider rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filtered.map((champ) => (
                <button
                  key={champ.id}
                  type="button"
                  onClick={() => addChampion(champ.id)}
                  disabled={value.includes(champ.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-on-surface hover:bg-surface-8 disabled:opacity-40 transition-colors"
                >
                  <Image
                    src={getChampionImageUrl(champ.id)}
                    alt={champ.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {champ.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
