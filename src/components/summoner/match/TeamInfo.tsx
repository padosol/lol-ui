"use client";

import type { ParticipantData } from "@/types/api";
import { getChampionImageUrl } from "@/utils/champion";
import { normalizeRegion } from "@/utils/summoner";
import Image from "next/image";
import Link from "next/link";

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
  const getSummonerUrl = (participant: ParticipantData) => {
    const normalizedRegion = normalizeRegion(region);
    // riotIdGameName과 riotIdTagline이 있으면 사용, 없으면 summonerName 사용
    const gameName = participant.riotIdGameName
      ? participant.riotIdTagline
        ? `${participant.riotIdGameName}-${participant.riotIdTagline}`
        : participant.riotIdGameName
      : participant.summonerName;
    const encodedName = encodeURIComponent(gameName);
    return `/summoners/${normalizedRegion}/${encodedName}`;
  };
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
                  className={`flex items-center gap-1 h-5 rounded ${
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
                    <Link
                      href={getSummonerUrl(participant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-white text-[10px] font-medium truncate leading-tight hover:text-blue-400 hover:underline transition-colors"
                    >
                      {participant.riotIdGameName || participant.summonerName}
                    </Link>
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
                  className={`flex items-center gap-1 h-5 rounded ${
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
                    <Link
                      href={getSummonerUrl(participant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-white text-[10px] font-medium truncate leading-tight hover:text-red-400 hover:underline transition-colors"
                    >
                      {participant.riotIdGameName || participant.summonerName}
                    </Link>
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
