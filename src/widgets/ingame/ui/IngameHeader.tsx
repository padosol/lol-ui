"use client";

import type { SpectatorData } from "@/entities/spectator";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface IngameHeaderProps {
  data: SpectatorData;
}

export default function IngameHeader({ data }: IngameHeaderProps) {
  const t = useTranslations("ingame");
  const tGameMode = useTranslations("domain.gameMode");
  const [gameTime, setGameTime] = useState<string>("0:00");

  // queueId → messages 의 domain.gameMode 키
  const queueTypeMap = {
    420: "RANKED_SOLO",
    440: "RANKED_FLEX",
    450: "ARAM",
    700: "CLASH",
    900: "URF",
    400: "NORMAL",
  } as const satisfies Record<number, string>;

  const queueKey =
    queueTypeMap[data.gameQueueConfigId as keyof typeof queueTypeMap];
  const gameType = queueKey
    ? tGameMode(queueKey)
    : t("unknownQueue", { id: data.gameQueueConfigId });

  useEffect(() => {
    const updateGameTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - data.gameStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setGameTime(`${minutes}:${String(seconds).padStart(2, "0")}`);
    };

    // 초기 시간 설정
    updateGameTime();

    // 1초마다 업데이트
    const interval = setInterval(updateGameTime, 1000);

    return () => clearInterval(interval);
  }, [data.gameStartTime]);

  return (
    <div className="bg-surface-2 backdrop-blur-sm border-b border-divider px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-on-surface font-semibold text-base">{gameType}</div>
            <div className="px-1.5 py-0.5 bg-error rounded text-on-surface text-xs font-bold">
              Live
            </div>
          </div>
          <div className="h-4 w-px bg-divider"></div>
          <div className="text-on-surface-medium text-sm">
            {t("gameTime", { time: gameTime })}
          </div>
        </div>
      </div>
    </div>
  );
}
