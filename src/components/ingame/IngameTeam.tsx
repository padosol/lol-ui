"use client";

import type { SpectatorParticipant, SpectatorBannedChampion } from "@/types/spectator";
import IngamePlayer from "./IngamePlayer";
import BannedChampions from "./BannedChampions";

interface IngameTeamProps {
  participants: SpectatorParticipant[];
  teamId: 100 | 200;
  teamName: string;
  teamColor: string;
  bannedChampions?: SpectatorBannedChampion[];
}

export default function IngameTeam({
  participants,
  teamId,
  teamName,
  teamColor,
  bannedChampions = [],
}: IngameTeamProps) {
  const teamParticipants = participants.filter((p) => p.teamId === teamId);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center justify-between text-sm font-bold ${teamColor} px-0 py-1.5 rounded-t-lg bg-gray-800/50`}
      >
        <span>{teamName}</span>
        {bannedChampions.length > 0 && (
          <div className="flex items-end">
            <BannedChampions
              bannedChampions={bannedChampions}
              align="right"
            />
          </div>
        )}
      </div>
      <div className="space-y-1">
        {teamParticipants.map((participant, index) => (
          <IngamePlayer key={index} participant={participant} />
        ))}
      </div>
    </div>
  );
}
