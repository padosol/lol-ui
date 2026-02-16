"use client";

import { useEffect } from "react";
import { useGameDataStore } from "@/stores/useGameDataStore";

/**
 * 앱 시작 시 champion, summoner, item 데이터를 미리 로드하는 컴포넌트
 */
export default function GameDataLoader() {
  const { loadChampionData, loadSummonerData, loadItemData } = useGameDataStore();

  useEffect(() => {
    // 앱 시작 시 데이터 미리 로드
    loadChampionData();
    loadSummonerData();
    loadItemData();
  }, [loadChampionData, loadSummonerData, loadItemData]);

  return null; // UI를 렌더링하지 않음
}

