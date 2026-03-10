"use client";

import { GameTooltip } from "@/shared/ui/tooltip";
import {
  RUNE_TREE_MAP,
  KEYSTONE_NAMES,
  STAT_PERK_NAMES,
  STAT_PERK_ROWS,
  STAT_PERK_ROW_KEYS,
} from "@/shared/constants/runes";
import type { RuneBuildData } from "@/entities/champion";
import { getPerkImageUrl } from "@/shared/lib/game";
import { getStyleImageUrl } from "@/shared/lib/styles";
import { useGameDataStore } from "@/shared/model/game-data";
import Image from "next/image";

/* ─── 스탯 퍼크 컬러/약자 맵 ─── */
const STAT_PERK_VISUAL: Record<number, { color: string; abbr: string }> = {
  5008: { color: "bg-orange-500", abbr: "AD" },
  5005: { color: "bg-yellow-400", abbr: "AS" },
  5007: { color: "bg-blue-400", abbr: "AH" },
  5002: { color: "bg-green-500", abbr: "AR" },
  5003: { color: "bg-purple-400", abbr: "MR" },
  5001: { color: "bg-red-500", abbr: "HP" },
};

interface RuneStatsProps {
  data: RuneBuildData[];
}

export default function RuneStats({ data }: RuneStatsProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">룬</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.slice(0, 2).map((build, i) => (
          <RunePageRow key={i} build={build} />
        ))}
      </div>
    </div>
  );
}

/* ─── 개별 룬 아이콘 ─── */
function RuneIcon({
  perkId,
  isSelected,
  isKeystone,
}: {
  perkId: number;
  isSelected: boolean;
  isKeystone: boolean;
}) {
  const sizeClass = isKeystone ? "w-8 h-8" : "w-6 h-6";
  const sizePx = isKeystone ? 32 : 24;
  const getRuneById = useGameDataStore((s) => s.getRuneById);
  const altText = getRuneById(perkId)?.name ?? KEYSTONE_NAMES[perkId] ?? `Rune ${perkId}`;

  return (
    <GameTooltip type="rune" id={perkId} disabled={!isSelected}>
      <div
        className={`${sizeClass} rounded-full overflow-hidden relative bg-surface-8 ${
          isSelected
            ? isKeystone
              ? "ring-2 ring-gold/60"
              : "ring-1 ring-white/30"
            : "opacity-25 grayscale"
        }`}
      >
        <Image
          src={getPerkImageUrl(perkId)}
          alt={altText}
          fill
          sizes={`${sizePx}px`}
          className="object-cover"
          unoptimized
        />
      </div>
    </GameTooltip>
  );
}

/* ─── 룬 행 (가로 정렬) ─── */
function RuneRow({
  perks,
  selectedPerkIds,
  isKeystoneRow,
}: {
  perks: number[];
  selectedPerkIds: Set<number>;
  isKeystoneRow: boolean;
}) {
  return (
    <div className="flex justify-center gap-1.5">
      {perks.map((perkId) => (
        <RuneIcon
          key={perkId}
          perkId={perkId}
          isSelected={selectedPerkIds.has(perkId)}
          isKeystone={isKeystoneRow}
        />
      ))}
    </div>
  );
}

/* ─── 트리 섹션 (헤더 + 행들) ─── */
function RuneTreeSection({
  treeId,
  selectedPerkIds,
  isPrimary,
}: {
  treeId: number;
  selectedPerkIds: Set<number>;
  isPrimary: boolean;
}) {
  const storeTree = useGameDataStore((s) => s.getRuneTreeById)(treeId);
  const fallbackTree = RUNE_TREE_MAP[treeId];

  const treeName = storeTree?.name ?? fallbackTree?.name;
  let keystones: number[];
  let rows: { perks: number[] }[];

  if (storeTree) {
    keystones = storeTree.slots[0]?.runes.map((r) => r.id) ?? [];
    rows = storeTree.slots.slice(1).map((slot) => ({
      perks: slot.runes.map((r) => r.id),
    }));
  } else if (fallbackTree) {
    keystones = fallbackTree.keystones;
    rows = fallbackTree.rows;
  } else {
    return null;
  }

  // 보조 트리: 선택된 룬이 있는 행만 표시
  const visibleRows = isPrimary
    ? rows
    : rows.filter((row) => row.perks.some((p) => selectedPerkIds.has(p)));

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* 트리 아이콘 + 이름 */}
      <div className="flex flex-col items-center gap-0.5 mb-0.5">
        <div className="w-5 h-5 relative shrink-0">
          <Image
            src={getStyleImageUrl(treeId)}
            alt={treeName ?? ""}
            fill
            sizes="20px"
            className="object-contain"
            unoptimized
          />
        </div>
        <span className="text-[9px] text-on-surface-medium">{treeName}</span>
      </div>

      {/* 키스톤 행 (메인 트리만) */}
      {isPrimary && (
        <>
          <RuneRow
            perks={keystones}
            selectedPerkIds={selectedPerkIds}
            isKeystoneRow
          />
          <div className="w-full h-px bg-divider/20" />
        </>
      )}

      {/* 소룬 행들 */}
      {visibleRows.map((row, idx) => (
        <RuneRow
          key={idx}
          perks={row.perks}
          selectedPerkIds={selectedPerkIds}
          isKeystoneRow={false}
        />
      ))}
    </div>
  );
}

/* ─── 스탯 퍼크 행 컴포넌트 ─── */
function StatPerkRow({
  label,
  perks,
  selectedPerkId,
}: {
  label: string;
  perks: number[];
  selectedPerkId: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {perks.map((perkId) => {
        const isSelected = perkId === selectedPerkId;
        const visual = STAT_PERK_VISUAL[perkId];
        return (
          <GameTooltip
            key={perkId}
            type="rune"
            id={perkId}
            disabled={!isSelected}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-opacity ${
                isSelected
                  ? `${visual?.color ?? "bg-surface-8"} text-white ring-1 ring-white/30`
                  : "bg-surface-8 text-on-surface-disabled opacity-40"
              }`}
              title={STAT_PERK_NAMES[perkId] ?? `Perk ${perkId}`}
            >
              {visual?.abbr ?? "?"}
            </div>
          </GameTooltip>
        );
      })}
      <span className="text-[9px] text-on-surface-medium ml-0.5">{label}</span>
    </div>
  );
}

/* ─── 룬 페이지 행 (빌드 1개) ─── */
function RunePageRow({ build }: { build: RuneBuildData }) {
  const primaryPerkIds = [
    build.primaryPerk0,
    build.primaryPerk1,
    build.primaryPerk2,
    build.primaryPerk3,
  ];
  const subPerkIds = [build.subPerk0, build.subPerk1];
  const allSelectedIds = new Set([...primaryPerkIds, ...subPerkIds]);

  const winRatePercent = build.winRate * 100;

  return (
    <div className="bg-surface rounded-lg px-4 py-3">
      <div className="flex items-start justify-center gap-0">
        {/* 주 트리 */}
        <RuneTreeSection
          treeId={build.primaryStyleId}
          selectedPerkIds={allSelectedIds}
          isPrimary
        />

        <div className="w-px self-stretch bg-divider/30 mx-3" />

        {/* 보조 트리 */}
        <RuneTreeSection
          treeId={build.subStyleId}
          selectedPerkIds={allSelectedIds}
          isPrimary={false}
        />

        <div className="w-px self-stretch bg-divider/30 mx-3" />

        {/* 스탯 파편 */}
        <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
          <span className="text-[9px] text-on-surface-medium mb-0.5">
            스탯
          </span>
          {STAT_PERK_ROWS.map((row, rowIdx) => {
            const key = STAT_PERK_ROW_KEYS[rowIdx];
            const perkMap: Record<string, number> = {
              offense: build.statPerkOffense,
              flex: build.statPerkFlex,
              defense: build.statPerkDefense,
            };
            const selectedId = perkMap[key] ?? 0;
            return (
              <StatPerkRow
                key={key}
                label={row.label}
                perks={row.perks}
                selectedPerkId={selectedId}
              />
            );
          })}
        </div>
      </div>

      {/* 승률/픽률/게임수 */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs">
        <span>
          <span className="text-on-surface-medium">승률 </span>
          <span
            className={`font-medium ${
              winRatePercent >= 50 ? "text-win" : "text-loss"
            }`}
          >
            {winRatePercent.toFixed(1)}%
          </span>
        </span>
        <span>
          <span className="text-on-surface-medium">픽률 </span>
          <span className="font-medium text-on-surface">
            {(build.pickRate * 100).toFixed(1)}%
          </span>
        </span>
        <span className="text-on-surface-medium">
          {build.games.toLocaleString()}게임
        </span>
      </div>
    </div>
  );
}
