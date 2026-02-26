"use client";

import type { LeagueInfoResponse } from "@/types/api";
import { useState } from "react";
import ChampionStats from "./ChampionStats";
import ChampionStatsOverview from "./ChampionStatsOverview";
import FanLetter from "./FanLetter";
import IngameTab from "./IngameTab";
import LeagueInfo from "./LeagueInfo";
import MatchHistory from "./MatchHistory";

interface ProfileTabsProps {
  summonerName: string;
  puuid?: string | null;
  region: string;
  initialLeagueData?: LeagueInfoResponse;
  refreshKey?: number;
}

type TabType = "overview" | "champions" | "ingame" | "fanletter";

export default function ProfileTabs({
  summonerName,
  puuid,
  region,
  initialLeagueData,
  refreshKey,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as TabType, label: "종합" },
    { id: "champions" as TabType, label: "챔피언 통계" },
    { id: "ingame" as TabType, label: "인게임" },
    // { id: "fanletter" as TabType, label: "팬 래터" },
  ];

  return (
    <div className="mt-6">
      {/* 탭 헤더 */}
      <div className="bg-surface-4 rounded-t-lg border border-b-0 border-divider">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "text-on-surface border-on-surface-medium bg-surface-1"
                  : "text-on-surface-medium border-transparent hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-surface-4 rounded-b-lg border border-divider">
        {activeTab === "overview" && (
          <div className="p-4 md:p-6">
            {/* 모바일 전용: 리그정보 + 모스트5를 매치 히스토리 위에 배치 */}
            <div className="lg:hidden space-y-4 mb-6">
              <LeagueInfo
                puuid={puuid}
                showTitle={false}
                initialData={initialLeagueData}
              />
              <ChampionStatsOverview
                puuid={puuid}
                showTitle={true}
                limit={5}
              />
            </div>

            {/* 데스크톱: 기존 3컬럼 그리드 유지 */}
            <div className="grid grid-cols-1 lg:grid-cols-[660px_1fr] gap-6">
              <div>
                <MatchHistory puuid={puuid} showTitle={false} refreshKey={refreshKey} />
              </div>
              <div className="hidden lg:block space-y-6">
                <LeagueInfo
                  puuid={puuid}
                  showTitle={false}
                  initialData={initialLeagueData}
                />
                <ChampionStatsOverview
                  puuid={puuid}
                  showTitle={true}
                  limit={5}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "champions" && (
          <div className="p-6">
            <ChampionStats puuid={puuid} showTitle={false} />
          </div>
        )}

        {activeTab === "ingame" && (
          <div className="p-6">
            <IngameTab region={region} puuid={puuid} />
          </div>
        )}

        {activeTab === "fanletter" && (
          <div className="p-6">
            <FanLetter summonerName={summonerName} />
          </div>
        )}
      </div>
    </div>
  );
}
