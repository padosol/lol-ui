"use client";

import IngameHeader from "@/components/ingame/IngameHeader";
import IngameTeam from "@/components/ingame/IngameTeam";
import { useActiveGame } from "@/hooks/useSpectator";
import { Gamepad2 } from "lucide-react";

interface IngameTabProps {
  region: string;
  puuid?: string | null;
}

export default function IngameTab({ region, puuid }: IngameTabProps) {
  const { data, isLoading, error, refetch } = useActiveGame(region, puuid);

  console.log(data)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-medium">인게임 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-2">
          오류: {error.message || "데이터를 불러올 수 없습니다"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-surface rounded-lg text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 게임 중이 아닌 경우
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Gamepad2 className="w-16 h-16 text-on-surface-medium mb-4" />
        <p className="text-on-surface text-lg font-medium mb-2">
          현재 게임 중이 아닙니다
        </p>
        <p className="text-on-surface-medium text-sm">
          소환사가 게임을 시작하면 여기에 정보가 표시됩니다
        </p>
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
          participants={data.participants ?? []}
          teamId={100}
          teamName="블루팀"
          teamColor="text-team-blue"
          bannedChampions={blueBans}
        />

        {/* 레드팀 */}
        <IngameTeam
          participants={data.participants ?? []}
          teamId={200}
          teamName="레드팀"
          teamColor="text-team-red"
          bannedChampions={redBans}
        />
      </div>
    </div>
  );
}
