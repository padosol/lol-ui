"use client";

import type { ParticipantData } from "@/entities/match";
import { normalizeRegion } from "@/entities/summoner";
import Link from "next/link";

interface SummonerNameLinkProps {
  participant: ParticipantData;
  region?: string;
  className?: string;
  tagClassName?: string;
  hoverClassName?: string;
}

export function getSummonerHref(
  participant: ParticipantData,
  region = "kr",
): string {
  const normalizedRegion = normalizeRegion(region);
  const gameName = participant.riotIdGameName
    ? participant.riotIdTagline
      ? `${participant.riotIdGameName}-${participant.riotIdTagline}`
      : participant.riotIdGameName
    : participant.summonerName;

  return `/summoners/${normalizedRegion}/${encodeURIComponent(gameName)}`;
}

export function getSummonerDisplayName(participant: ParticipantData): string {
  return participant.riotIdGameName || participant.summonerName;
}

export default function SummonerNameLink({
  participant,
  region = "kr",
  className = "",
  tagClassName = "text-on-surface-medium",
  hoverClassName = "",
}: SummonerNameLinkProps) {
  return (
    <Link
      href={getSummonerHref(participant, region)}
      target="_blank"
      rel="noopener noreferrer"
      prefetch={false}
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center min-w-0 ${className} ${hoverClassName}`.trim()}
    >
      <span className="truncate min-w-0">{getSummonerDisplayName(participant)}</span>
      {participant.riotIdTagline && (
        <span className={`ml-1 shrink-0 ${tagClassName}`.trim()}>
          #{participant.riotIdTagline}
        </span>
      )}
    </Link>
  );
}
