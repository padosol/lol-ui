"use client";

import type { Match, MatchDetail, ParticipantData } from "@/entities/match";
import { useTranslations } from "next-intl";
import { useState } from "react";
import BuildTab from "./BuildTab";
import MatchDetailOverview from "./MatchDetailOverview";

interface MatchDetailInfoProps {
  detail: MatchDetail;
  match: Match;
  isArena: boolean;
  blueTeam: ParticipantData[];
  redTeam: ParticipantData[];
  puuid: string | null;
  region?: string;
}

type DetailTab = "overview" | "build";

export default function MatchDetailInfo({
  detail,
  match,
  isArena,
  blueTeam,
  redTeam,
  puuid,
  region,
}: MatchDetailInfoProps) {
  const t = useTranslations("matchDetail.tabs");
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const tabs: DetailTab[] = ["overview", "build"];

  return (
    <div
      className="border-t border-divider/50 bg-surface-4/80 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 탭 바: 아레나 모드가 아닐 때만 표시 */}
      {!isArena && (
        <div className="flex gap-0 border-b border-divider/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-medium transition-colors border-b-2 cursor-pointer ${activeTab === tab
                  ? "text-on-surface border-on-surface-medium"
                  : "text-on-surface-medium border-transparent hover:text-on-surface"
                }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      )}

      {/* 탭 콘텐츠 */}
      <div className="p-1">
        {(isArena || activeTab === "overview") && (
          <MatchDetailOverview
            detail={detail}
            match={match}
            isArena={isArena}
            blueTeam={blueTeam}
            redTeam={redTeam}
            puuid={puuid}
            region={region}
          />
        )}

        {!isArena && activeTab === "build" && (
          <BuildTab
            detail={detail}
            blueTeam={blueTeam}
            redTeam={redTeam}
            puuid={puuid}
            region={region}
          />
        )}
      </div>
    </div>
  );
}
