"use client";

import { usePatchNote } from "@/hooks/usePatchNotes";
import type {
  AramChanges as AramChangesType,
  ArenaChanges as ArenaChangesType,
  PatchNoteExtended,
  PatchSummary,
} from "@/types/patchnotes";
import { ExternalLink, Gamepad2, Map, Settings, Snowflake } from "lucide-react";
import { useState } from "react";
import AramChanges from "./AramChanges";
import ArenaChanges from "./ArenaChanges";
import ChampionChanges from "./ChampionChanges";
import ItemChanges from "./ItemChanges";
import MetaPredictions from "./MetaPredictions";
import PatchVisualSummary from "./PatchVisualSummary";
import SystemChanges from "./SystemChanges";

function calculateSummary(patchNote: PatchNoteExtended): PatchSummary {
  const championBuffs = patchNote.champions.filter(
    (c) => c.changeType === "buff"
  ).length;
  const championNerfs = patchNote.champions.filter(
    (c) => c.changeType === "nerf"
  ).length;
  const championAdjusts = patchNote.champions.filter(
    (c) => c.changeType === "adjust" || c.changeType === "rework"
  ).length;

  const itemBuffs = patchNote.items.filter(
    (i) => i.changeType === "buff"
  ).length;
  const itemNerfs = patchNote.items.filter(
    (i) => i.changeType === "nerf"
  ).length;
  const itemAdjusts = patchNote.items.filter(
    (i) => i.changeType === "adjust" || i.changeType === "new"
  ).length;

  // 아레나 통계 계산
  const arena = patchNote.arena;
  const arenaBuffs =
    arena?.champions.filter((c) => c.changeType === "buff").length ?? 0;
  const arenaNerfs =
    arena?.champions.filter((c) => c.changeType === "nerf").length ?? 0;
  const arenaAdjusts =
    arena?.champions.filter(
      (c) => c.changeType === "adjust" || c.changeType === "rework"
    ).length ?? 0;

  return {
    championBuffs,
    championNerfs,
    championAdjusts,
    itemBuffs,
    itemNerfs,
    itemAdjusts,
    arenaBuffs,
    arenaNerfs,
    arenaAdjusts,
  };
}

type TabType = "rift" | "aram" | "arena" | "system";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isAvailable: (data: PatchNoteExtended) => boolean;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: "rift",
    label: "협곡",
    icon: <Map className="w-4 h-4" />,
    isAvailable: (data) =>
      data.champions.length > 0 || data.items.length > 0,
  },
  {
    id: "aram",
    label: "무작위 총력전",
    icon: <Snowflake className="w-4 h-4" />,
    isAvailable: (data) =>
      !!data.aram &&
      (data.aram.champions.length > 0 || data.aram.systems.length > 0),
  },
  {
    id: "arena",
    label: "아레나",
    icon: <Gamepad2 className="w-4 h-4" />,
    isAvailable: (data) =>
      !!data.arena &&
      (data.arena.champions.length > 0 || data.arena.systems.length > 0),
  },
  {
    id: "system",
    label: "시스템",
    icon: <Settings className="w-4 h-4" />,
    isAvailable: (data) => data.systems.length > 0,
  },
];

interface PatchContentProps {
  version: string | null;
}

export default function PatchContent({ version }: PatchContentProps) {
  const { data: patchNote, isLoading, error } = usePatchNote(version || "");
  const [activeTab, setActiveTab] = useState<TabType>("rift");

  if (!version) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">
          좌측에서 패치 버전을 선택해주세요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* 헤더 스켈레톤 */}
        <div className="bg-surface-1 rounded-lg border border-divider/50 p-6">
          <div className="h-8 w-48 bg-surface-4 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-surface-4 rounded animate-pulse" />
        </div>

        {/* 탭 스켈레톤 */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-10 w-24 bg-surface-4 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* 섹션 스켈레톤 */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-surface-1 rounded-lg border border-divider/50 p-4"
          >
            <div className="h-6 w-40 bg-surface-4 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[...Array(3)].map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="h-16 bg-surface-2 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">
          패치노트를 불러오는데 실패했습니다.
        </p>
      </div>
    );
  }

  if (!patchNote) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">패치노트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 확장 데이터
  const extendedData = patchNote as PatchNoteExtended & {
    arena?: ArenaChangesType;
    aram?: AramChangesType;
  };

  // 활성화된 탭 목록
  const availableTabs = TAB_CONFIGS.filter((tab) =>
    tab.isAvailable(extendedData)
  );

  // 현재 탭이 사용 불가능하면 첫 번째 사용 가능한 탭으로 변경
  const currentTab =
    availableTabs.find((t) => t.id === activeTab) || availableTabs[0];

  const hasContent = availableTabs.length > 0;

  // 탭별 콘텐츠 렌더링
  const renderTabContent = () => {
    if (!currentTab) return null;

    switch (currentTab.id) {
      case "rift":
        return (
          <>
            {/* 비주얼 패치요약 */}
            <PatchVisualSummary
              champions={patchNote.champions}
              items={patchNote.items}
            />

            {/* 메타 영향 예측 */}
            {extendedData.metaPredictions &&
              extendedData.metaPredictions.length > 0 && (
                <MetaPredictions predictions={extendedData.metaPredictions} />
              )}

            {/* 챔피언 변경사항 */}
            <ChampionChanges changes={patchNote.champions} />

            {/* 아이템 변경사항 */}
            <ItemChanges changes={patchNote.items} />
          </>
        );

      case "aram":
        if (!extendedData.aram) return null;
        return (
          <>
            {/* 비주얼 패치요약 */}
            <PatchVisualSummary champions={extendedData.aram.champions} />

            {/* ARAM 변경사항 */}
            <div className="bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-divider/50">
                <Snowflake className="w-5 h-5 text-info" />
                <span className="text-lg font-bold text-on-surface">
                  무작위 총력전 변경사항
                </span>
                <span className="text-sm text-on-surface-medium px-2 py-0.5 rounded-full bg-surface-4">
                  {extendedData.aram.champions.length +
                    extendedData.aram.systems.length}
                </span>
              </div>
              <div className="p-4">
                <AramChanges changes={extendedData.aram} />
              </div>
            </div>
          </>
        );

      case "arena":
        if (!extendedData.arena) return null;
        return (
          <>
            {/* 비주얼 패치요약 */}
            <PatchVisualSummary champions={extendedData.arena.champions} />

            {/* 아레나 변경사항 */}
            <ArenaChanges changes={extendedData.arena} />
          </>
        );

      case "system":
        return <SystemChanges changes={patchNote.systems} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 패치 헤더 */}
      <div className="bg-surface-1 rounded-lg border border-divider/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface mb-1">
              패치 {patchNote.version}
            </h2>
            <p className="text-on-surface-medium">
              {formatDate(patchNote.releaseDate)}
            </p>
          </div>
          {/* 전체 내용 보러가기 버튼 */}
          <a
            href={`https://www.leagueoflegends.com/ko-kr/news/game-updates/patch-${patchNote.version.replace(".", "-")}-notes/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-variant text-surface rounded-lg text-sm font-medium transition-colors"
          >
            전체 내용 보러가기
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 변경사항 섹션들 */}
      {hasContent ? (
        <>
          {/* 탭 네비게이션 */}
          <div className="flex flex-wrap gap-2">
            {availableTabs.map((tab) => {
              const isActive = currentTab?.id === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-surface"
                      : "bg-surface-2 text-on-surface-medium hover:bg-surface-4 hover:text-on-surface"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="space-y-4">{renderTabContent()}</div>
        </>
      ) : (
        <div className="flex items-center justify-center h-32 bg-surface-1 rounded-lg border border-divider/50">
          <p className="text-on-surface-medium">변경사항이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
