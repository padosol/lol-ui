"use client";

import type { ParticipantData } from "@/entities/match";
import { getChampionImageUrl } from "@/entities/champion";
import Image from "next/image";
import SummonerNameLink from "./SummonerNameLink";

interface TeamInfoProps {
  blueTeam: ParticipantData[];
  redTeam: ParticipantData[];
  myPuuid: string | null;
  region?: string;
}

export default function TeamInfo({
  blueTeam,
  redTeam,
  myPuuid,
  region = "kr",
}: TeamInfoProps) {
  return (
    <div className="grid grid-cols-[90px_90px] gap-1 items-start">
      {/* 블루팀 */}
      {blueTeam.length > 0 && (
        <div className="flex flex-col w-[90px] shrink-0">
          <div className="text-team-blue text-[10px] font-semibold h-[14px] flex items-center">
            블루팀
          </div>
          <div className="space-y-0">
            {blueTeam.map((participant) => {
              const isMe = participant.puuid === myPuuid;
              return (
                <div
                  key={participant.participantId}
                  className={`flex items-center gap-1 h-5 rounded ${
                    isMe ? "bg-team-blue/20" : "bg-surface-4/20"
                  }`}
                >
                  <div className="w-4 h-4 bg-surface-8 rounded overflow-hidden shrink-0 relative">
                    <Image
                      src={getChampionImageUrl(participant.championName || "")}
                      alt={participant.championName || "Unknown"}
                      fill
                      sizes="16px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <SummonerNameLink
                      participant={participant}
                      region={region}
                      className="text-on-surface text-[10px] font-medium leading-tight"
                      hoverClassName="hover:text-team-blue hover:underline transition-colors"
                    />
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
          <div className="text-team-red text-[10px] font-semibold h-[14px] flex items-center">
            레드팀
          </div>
          <div className="space-y-0">
            {redTeam.map((participant) => {
              const isMe = participant.puuid === myPuuid;
              return (
                <div
                  key={participant.participantId}
                  className={`flex items-center gap-1 h-5 rounded ${
                    isMe ? "bg-team-red/20 " : "bg-surface-4/20"
                  }`}
                >
                  <div className="w-4 h-4 bg-surface-8 rounded overflow-hidden shrink-0 relative">
                    <Image
                      src={getChampionImageUrl(participant.championName || "")}
                      alt={participant.championName || "Unknown"}
                      fill
                      sizes="16px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <SummonerNameLink
                      participant={participant}
                      region={region}
                      className="text-on-surface text-[10px] font-medium leading-tight"
                      hoverClassName="hover:text-team-red hover:underline transition-colors"
                    />
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
