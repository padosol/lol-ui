"use client";

import type { ParticipantData } from "@/entities/match";
import { getChampionImageUrl } from "@/entities/champion";
import Image from "next/image";
import SummonerNameLink from "./SummonerNameLink";

interface ArenaTeamInfoProps {
  participants: ParticipantData[];
  myPuuid: string | null;
  myPlacement: number;
  region?: string;
}

export default function ArenaTeamInfo({
  participants,
  myPuuid,
  myPlacement: _myPlacement,
  region = "kr",
}: ArenaTeamInfoProps) {
  // placement가 유효한지 확인
  const hasValidPlacement = participants.some(p => p.placement > 0);

  const displayTeams: { team: ParticipantData[]; placement: number | null }[] = [];

  if (hasValidPlacement) {
    // 기존 로직: placement별로 그룹화
    const placementGroups = participants.reduce((acc, p) => {
      const placement = p.placement || 999;
      if (!acc[placement]) acc[placement] = [];
      acc[placement].push(p);
      return acc;
    }, {} as Record<number, ParticipantData[]>);

    for (let i = 1; i <= 4; i++) {
      const team = placementGroups[i];
      if (team && team.length > 0) {
        displayTeams.push({ team, placement: i });
      }
    }
  } else {
    // 폴백: 순서대로 2명씩 묶어서 최대 4팀 표시
    for (let i = 0; i < Math.min(participants.length, 8); i += 2) {
      const team = participants.slice(i, i + 2);
      if (team.length > 0) {
        displayTeams.push({ team, placement: null });
      }
    }
  }

  return (
    <div className="flex flex-col justify-between h-full w-full max-w-[200px]">
      {/* 상위 4개 팀 표시 */}
      <div className="flex flex-col justify-between h-full gap-0 w-full">
        {displayTeams.map(({ team, placement }, index) => {
          const isMyTeam = team.some((p) => p.puuid === myPuuid);
          return (
            <div
              key={placement ?? index}
              className={`py-0.5 rounded w-full ${
                isMyTeam
                  ? "bg-loss/20 border border-loss/50"
                  : "bg-surface-4/30"
              }`}
            >
              <div className="flex items-center gap-1 w-full min-w-0">
                <div
                  className={`text-[10px] w-6 shrink-0 text-center ${
                    placement === 1
                      ? "text-gold font-semibold"
                      : "text-on-surface-medium"
                  }`}
                >
                  {placement != null ? `${placement}위` : "-"}
                </div>
                {team.slice(0, 2).map((participant) => (
                  <div
                    key={participant.participantId}
                    className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden"
                  >
                    <div className="w-4 h-4 bg-surface-8 rounded overflow-hidden relative shrink-0">
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
                    <SummonerNameLink
                      participant={participant}
                      region={region}
                      className="text-on-surface text-[10px] flex-1"
                      hoverClassName="hover:text-primary hover:underline transition-colors"
                    />
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
