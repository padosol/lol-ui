"use client";

import type { LeagueInfoResponse } from "@/entities/league";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ChampionStats from "./ChampionStats";
import ChampionStatsOverview from "./ChampionStatsOverview";
import FanLetter from "./FanLetter";
import { IngameTab } from "@/widgets/ingame";
import { LeagueInfo } from "@/entities/league";
import { MatchHistory } from "@/widgets/match-history";
import { RecentlyPlayed } from "@/widgets/recently-played";

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
  const t = useTranslations("summoner.tabs");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // "fanletter" 는 아직 노출하지 않는다.
  const tabs = ["overview", "champions", "ingame"] as const;

  return (
    <div className="mt-6">
      {/* 탭 헤더 */}
      <div className="bg-surface-2 rounded-t-lg border border-b-0 border-divider">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 cursor-pointer ${
                activeTab === tab
                  ? "text-on-surface border-on-surface-medium bg-surface-1"
                  : "text-on-surface-medium border-transparent hover:text-on-surface"
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-surface-1 rounded-b-lg border border-divider">
        {activeTab === "overview" && (
          <div className="py-4 md:p-6">
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
              <RecentlyPlayed puuid={puuid} region={region} />
            </div>

            {/* 데스크톱: 기존 3컬럼 그리드 유지 */}
            <div className="grid grid-cols-1 lg:grid-cols-[660px_1fr] gap-6">
              <div>
                <MatchHistory puuid={puuid} region={region} showTitle={false} refreshKey={refreshKey} />
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
                <RecentlyPlayed puuid={puuid} region={region} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "champions" && (
          <div className="p-0 md:p-6">
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
