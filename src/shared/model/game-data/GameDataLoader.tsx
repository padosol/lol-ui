"use client";

import { useEffect } from "react";
import { useGameDataStore } from "./useGameDataStore";

export default function GameDataLoader() {
  const loadChampionData = useGameDataStore((s) => s.loadChampionData);
  const loadSummonerData = useGameDataStore((s) => s.loadSummonerData);
  const loadItemData = useGameDataStore((s) => s.loadItemData);
  const loadRuneData = useGameDataStore((s) => s.loadRuneData);

  useEffect(() => {
    loadChampionData();
    loadSummonerData();
    loadItemData();
    loadRuneData();
  }, [loadChampionData, loadSummonerData, loadItemData, loadRuneData]);

  return null;
}
