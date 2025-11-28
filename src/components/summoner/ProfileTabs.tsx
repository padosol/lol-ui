"use client";

import { useState } from "react";
import ChampionStats from "./ChampionStats";
import FanLetter from "./FanLetter";
import LeagueInfo from "./LeagueInfo";
import MatchHistory from "./MatchHistory";

interface ProfileTabsProps {
  summonerName: string;
  puuid?: string | null;
}

type TabType = "overview" | "champions" | "ingame" | "fanletter";

export default function ProfileTabs({ summonerName, puuid }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as TabType, label: "종합" },
    { id: "champions" as TabType, label: "챔피언 통계" },
    { id: "ingame" as TabType, label: "인게임" },
    { id: "fanletter" as TabType, label: "팬 래터" },
  ];

  return (
    <div className="mt-6">
      {/* 탭 헤더 */}
      <div className="bg-gray-800 rounded-t-lg border border-b-0 border-gray-700">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-blue-500 border-blue-500 bg-gray-900"
                  : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-gray-800 rounded-b-lg border border-gray-700">
        {activeTab === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MatchHistory puuid={puuid} showTitle={false} />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <LeagueInfo puuid={puuid} showTitle={false} />
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">
                    주요 챔피언
                  </h3>
                  <ChampionStats
                    puuid={puuid}
                    showTitle={false}
                    limit={5}
                  />
                </div>
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
            <div className="text-center py-12">
              <p className="text-gray-400">인게임 정보가 여기에 표시됩니다.</p>
            </div>
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
