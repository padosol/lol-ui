"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useGameDataStore } from "@/shared/model/game-data";
import { useSeasonStore } from "@/entities/season";
import { toLocale } from "@/shared/i18n/locale";

export default function GameDataLoader() {
  const locale = toLocale(useLocale());
  const loadChampionData = useGameDataStore((s) => s.loadChampionData);
  const loadSummonerData = useGameDataStore((s) => s.loadSummonerData);
  const loadItemData = useGameDataStore((s) => s.loadItemData);
  const loadRuneData = useGameDataStore((s) => s.loadRuneData);
  const setGameDataContext = useGameDataStore((s) => s.setGameDataContext);
  const loadSeasons = useSeasonStore((s) => s.loadSeasons);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 게임 데이터 경로에 패치 버전이 들어가므로 시즌 정보를 먼저 받는다.
      // 실패하면 patchVersion 이 null 로 남아 번들된 public/data 로 떨어진다.
      await loadSeasons();
      if (cancelled) return;

      setGameDataContext(useSeasonStore.getState().getLatestPatchVersion(), locale);

      loadChampionData();
      loadSummonerData();
      loadItemData();
      loadRuneData();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    locale,
    loadSeasons,
    setGameDataContext,
    loadChampionData,
    loadSummonerData,
    loadItemData,
    loadRuneData,
  ]);

  return null;
}
