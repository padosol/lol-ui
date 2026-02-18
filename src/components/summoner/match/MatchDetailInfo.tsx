"use client";

import type { Match, MatchDetail, ParticipantData } from "@/types/api";
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
}

type DetailTab = "overview" | "build";

export default function MatchDetailInfo({
  detail,
  match,
  isArena,
  blueTeam,
  redTeam,
  puuid,
}: MatchDetailInfoProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "overview", label: "종합" },
    { id: "build", label: "빌드" },
  ];

  return (
    <div
      className="border-t border-divider/50 bg-surface-1/80 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 탭 바: 아레나 모드가 아닐 때만 표시 */}
      {!isArena && (
        <div className="flex gap-0 border-b border-divider/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "text-on-surface border-on-surface-medium"
                  : "text-on-surface-medium border-transparent hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 탭 콘텐츠 */}
      <div className="p-3">
        {(isArena || activeTab === "overview") && (
          <MatchDetailOverview
            detail={detail}
            match={match}
            isArena={isArena}
            blueTeam={blueTeam}
            redTeam={redTeam}
            puuid={puuid}
          />
        )}

        {!isArena && activeTab === "build" && (
          <BuildTab
            detail={detail}
            blueTeam={blueTeam}
            redTeam={redTeam}
            puuid={puuid}
          />
        )}
      </div>
    </div>
  );
}
