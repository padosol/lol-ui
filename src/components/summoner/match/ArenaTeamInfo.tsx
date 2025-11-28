"use client";

import type { ParticipantData } from "@/types/api";
import { getChampionImageUrl } from "@/utils/champion";
import Image from "next/image";

interface ArenaTeamInfoProps {
  participants: ParticipantData[];
  myPuuid: string | null;
  myPlacement: number;
}

export default function ArenaTeamInfo({
  participants,
  myPuuid,
  myPlacement,
}: ArenaTeamInfoProps) {
  // placement별로 그룹화 (아레나에서는 같은 placement가 같은 팀)
  const placementGroups = participants.reduce((acc, p) => {
    const placement = p.placement || 999;
    if (!acc[placement]) acc[placement] = [];
    acc[placement].push(p);
    return acc;
  }, {} as Record<number, ParticipantData[]>);

  // 1~4위 팀을 순서대로 표시
  const displayTeams = [];
  for (let i = 1; i <= 4; i++) {
    const team = placementGroups[i];
    if (team && team.length > 0) {
      displayTeams.push({
        team,
        placement: i,
      });
    }
  }

  return (
    <div className="flex flex-col justify-between h-full w-full max-w-[200px]">
      {/* 상위 4개 팀 표시 */}
      <div className="flex flex-col justify-between h-full gap-0 w-full">
        {displayTeams.map(({ team, placement }) => {
          const isMyTeam = team.some((p) => p.puuid === myPuuid);
          return (
            <div
              key={placement}
              className={`py-0.5 rounded w-full ${
                isMyTeam
                  ? "bg-red-900/30 border border-red-500/50"
                  : "bg-gray-800/30"
              }`}
            >
              <div className="flex items-center gap-1 w-full min-w-0">
                <div className="text-gray-400 text-[10px] w-6 shrink-0">
                  {placement}위
                </div>
                {team.slice(0, 2).map((participant) => (
                  <div
                    key={participant.participantId}
                    className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden"
                  >
                    <div className="w-4 h-4 bg-gray-700 rounded overflow-hidden relative shrink-0">
                      <Image
                        src={getChampionImageUrl(
                          participant.championName || ""
                        )}
                        alt={participant.championName || "Unknown"}
                        fill
                        sizes="16px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-white text-[10px] truncate min-w-0 flex-1">
                      {participant.riotIdGameName || participant.summonerName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
