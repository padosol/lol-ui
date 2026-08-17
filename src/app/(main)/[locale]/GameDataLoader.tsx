"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useGameDataStore } from "@/shared/model/game-data";
import { useSeasonStore } from "@/entities/season";
import { useVersionStore } from "@/entities/version";
import { toLocale } from "@/shared/i18n/locale";

export default function GameDataLoader() {
  const locale = toLocale(useLocale());
  const loadChampionData = useGameDataStore((s) => s.loadChampionData);
  const loadSummonerData = useGameDataStore((s) => s.loadSummonerData);
  const loadItemData = useGameDataStore((s) => s.loadItemData);
  const loadRuneData = useGameDataStore((s) => s.loadRuneData);
  const setGameDataContext = useGameDataStore((s) => s.setGameDataContext);
  const loadSeasons = useSeasonStore((s) => s.loadSeasons);
  const loadLatestVersion = useVersionStore((s) => s.loadLatestVersion);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 게임 데이터 경로에는 Data Dragon 버전(16.16.1)이 들어간다. 시즌의 패치
      // 버전(16.16)은 챔피언 통계용 축이라 경로로 쓰면 404 가 나므로 versions API 를 본다.
      // 시즌은 챔피언 통계 화면들이 이 로더의 적재에 기대고 있어 함께 받는다.
      // 둘 사이에 의존이 없으니 병렬로 받고, 실패하면 버전이 null 로 남아
      // 번들된 public/data 로 떨어진다.
      await Promise.all([loadSeasons(), loadLatestVersion()]);
      if (cancelled) return;

      setGameDataContext(useVersionStore.getState().getDataVersion(), locale);

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
    loadLatestVersion,
    setGameDataContext,
    loadChampionData,
    loadSummonerData,
    loadItemData,
    loadRuneData,
  ]);

  return null;
}
