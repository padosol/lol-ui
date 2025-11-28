"use client";

import type { ParticipantData } from "@/types/api";
import { getChampionImageUrl } from "@/utils/champion";
import Image from "next/image";

interface TeamInfoProps {
  blueTeam: ParticipantData[];
  redTeam: ParticipantData[];
  myPuuid: string | null;
}

export default function TeamInfo({
  blueTeam,
  redTeam,
  myPuuid,
}: TeamInfoProps) {
  return (
    <div className="grid grid-cols-[90px_90px] gap-1 items-start">
      {/* 블루팀 */}
      {blueTeam.length > 0 && (
        <div className="flex flex-col w-[90px] shrink-0">
          <div className="text-blue-400 text-[10px] font-semibold h-[14px] flex items-center">
            블루팀
          </div>
          <div className="space-y-0">
            {blueTeam.map((participant) => {
              const isMe = participant.puuid === myPuuid;
              return (
                <div
                  key={participant.participantId}
                  className={`flex items-center gap-1 py-0.5 rounded ${
                    isMe ? "bg-blue-900/50" : "bg-gray-800/20"
                  }`}
                >
                  <div className="w-4 h-4 bg-gray-700 rounded overflow-hidden shrink-0 relative">
                    <Image
                      src={getChampionImageUrl(participant.championName || "")}
                      alt={participant.championName || "Unknown"}
                      fill
                      sizes="16px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[10px] font-medium truncate">
                      {participant.riotIdGameName || participant.summonerName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 레드팀 */}
      {redTeam.length > 0 && (
        <div className="flex flex-col w-[90px] shrink-0">
          <div className="text-red-400 text-[10px] font-semibold h-[14px] flex items-center">
            레드팀
          </div>
          <div className="space-y-0">
            {redTeam.map((participant) => {
              const isMe = participant.puuid === myPuuid;
              return (
                <div
                  key={participant.participantId}
                  className={`flex items-center gap-1 py-0.5 rounded ${
                    isMe ? "bg-red-900/50 " : "bg-gray-800/20"
                  }`}
                >
                  <div className="w-4 h-4 bg-gray-700 rounded overflow-hidden shrink-0 relative">
                    <Image
                      src={getChampionImageUrl(participant.championName || "")}
                      alt={participant.championName || "Unknown"}
                      fill
                      sizes="16px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[10px] font-medium truncate">
                      {participant.riotIdGameName || participant.summonerName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
