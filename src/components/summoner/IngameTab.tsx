"use client";

import IngameHeader from "@/components/ingame/IngameHeader";
import IngameTeam from "@/components/ingame/IngameTeam";
import type { SpectatorData } from "@/types/spectator";
import { useEffect, useState } from "react";

export default function IngameTab() {
  const [data, setData] = useState<SpectatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpectatorData = async () => {
      try {
        const response = await fetch("/data/spectator.json");
        if (!response.ok) {
          throw new Error("Failed to load spectator data");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadSpectatorData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">인게임 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-2">
          오류: {error || "데이터를 불러올 수 없습니다"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const blueBans = data.bannedChampions?.filter((b) => b.teamId === 100) || [];
  const redBans = data.bannedChampions?.filter((b) => b.teamId === 200) || [];

  return (
    <div className="space-y-3">
      <IngameHeader data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 블루팀 */}
        <IngameTeam
          participants={data.participants}
          teamId={100}
          teamName="블루팀"
          teamColor="text-blue-400"
          bannedChampions={blueBans}
        />

        {/* 레드팀 */}
        <IngameTeam
          participants={data.participants}
          teamId={200}
          teamName="레드팀"
          teamColor="text-red-400"
          bannedChampions={redBans}
        />
      </div>
    </div>
  );
}
