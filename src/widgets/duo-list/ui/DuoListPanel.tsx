"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useDuoStore } from "@/entities/duo";
import type { GameType, DuoPosition } from "@/entities/duo";
import { DuoFilters } from "@/features/duo-filter";
import { DuoRegisterModal } from "@/features/duo-register";
import DuoCard from "./DuoCard";

export default function DuoListPanel() {
  const listings = useDuoStore((s) => s.listings);
  const [modalOpen, setModalOpen] = useState(false);
  const [gameType, setGameType] = useState<GameType | "ALL">("ALL");
  const [position, setPosition] = useState<DuoPosition | "ALL">("ALL");

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (gameType !== "ALL" && l.gameType !== gameType) return false;
      if (position !== "ALL" && l.position !== position) return false;
      return true;
    });
  }, [listings, gameType, position]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-on-surface">듀오 찾기</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-on-surface font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            듀오 등록
          </button>
        </div>

        <DuoFilters
          gameType={gameType}
          position={position}
          onGameTypeChange={setGameType}
          onPositionChange={setPosition}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-on-surface-disabled">
            등록된 듀오가 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((listing) => (
              <DuoCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <DuoRegisterModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
