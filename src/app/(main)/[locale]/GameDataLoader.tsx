"use client";

import { useEffect } from "react";
import { useGameDataStore } from "@/shared/model/game-data";
import { useSeasonStore } from "@/entities/season";

export default function GameDataLoader() {
  const loadChampionData = useGameDataStore((s) => s.loadChampionData);
  const loadSummonerData = useGameDataStore((s) => s.loadSummonerData);
  const loadItemData = useGameDataStore((s) => s.loadItemData);
  const loadRuneData = useGameDataStore((s) => s.loadRuneData);
  const loadSeasons = useSeasonStore((s) => s.loadSeasons);

  useEffect(() => {
    loadChampionData();
    loadSummonerData();
    loadItemData();
    loadRuneData();
    loadSeasons();
  }, [loadChampionData, loadSummonerData, loadItemData, loadRuneData, loadSeasons]);

  return null;
}
