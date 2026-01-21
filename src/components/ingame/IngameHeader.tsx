"use client";

import type { SpectatorData } from "@/types/spectator";
import { useEffect, useState } from "react";

interface IngameHeaderProps {
  data: SpectatorData;
}

export default function IngameHeader({ data }: IngameHeaderProps) {
  const [gameTime, setGameTime] = useState<string>("0:00");

  const queueTypeMap: { [key: number]: string } = {
    420: "솔로 랭크",
    440: "자유 랭크",
    450: "칼바람 나락",
    700: "격전",
    900: "우르프",
    400: "일반",
  };

  const gameType =
    queueTypeMap[data.gameQueueConfigId] || `큐 ID: ${data.gameQueueConfigId}`;

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
    <div className="bg-surface-4/80 backdrop-blur-sm border-b border-divider px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-on-surface font-semibold text-base">{gameType}</div>
            <div className="px-1.5 py-0.5 bg-error rounded text-on-surface text-xs font-bold">
              Live
            </div>
          </div>
          <div className="h-4 w-px bg-divider"></div>
          <div className="text-on-surface-medium text-sm">게임시간: {gameTime}</div>
        </div>
      </div>
    </div>
  );
}
