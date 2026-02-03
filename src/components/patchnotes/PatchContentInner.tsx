"use client";

import { useSuspensePatchNote } from "@/hooks/usePatchNotes";
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
  const common = patchNote.common;
  const championBuffs = common.champions.filter(
    (c) => c.changeType === "buff"
  ).length;
  const championNerfs = common.champions.filter(
    (c) => c.changeType === "nerf"
  ).length;
  const championAdjusts = common.champions.filter(
    (c) => c.changeType === "adjust" || c.changeType === "rework"
  ).length;

  const itemBuffs = common.items.filter(
    (i) => i.changeType === "buff"
  ).length;
  const itemNerfs = common.items.filter(
    (i) => i.changeType === "nerf"
  ).length;
  const itemAdjusts = common.items.filter(
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
      data.common.champions.length > 0 || data.common.items.length > 0,
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

interface PatchContentInnerProps {
  version: string;
}

export default function PatchContentInner({ version }: PatchContentInnerProps) {
  const { data: patchNote } = useSuspensePatchNote(version);
  const [activeTab, setActiveTab] = useState<TabType>("rift");

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
              champions={patchNote.common.champions}
            />

            {/* 메타 영향 예측 */}
            {extendedData.metaPredictions &&
              extendedData.metaPredictions.length > 0 && (
                <MetaPredictions predictions={extendedData.metaPredictions} />
              )}

            {/* 챔피언 변경사항 */}
            <ChampionChanges changes={patchNote.common.champions} />

            {/* 아이템 변경사항 */}
            <ItemChanges changes={patchNote.common.items} />
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
              {patchNote.createdAt ? formatDate(patchNote.createdAt) : ""}
            </p>
          </div>
          {/* 전체 내용 보러가기 버튼 */}
          <a
            href={patchNote.patchUrl || `https://www.leagueoflegends.com/ko-kr/news/game-updates/patch-${patchNote.version.replace(".", "-")}-notes/`}
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
