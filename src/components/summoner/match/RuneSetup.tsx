import GameTooltip from "@/components/tooltip/GameTooltip";
import {
  KEYSTONE_NAMES,
  RUNE_TREE_MAP,
  STAT_PERK_NAMES,
  STAT_PERK_ROWS,
  STAT_PERK_ROW_KEYS,
} from "@/constants/runes";
import { logger } from "@/lib/logger";
import { useGameDataStore } from "@/stores/useGameDataStore";
import type { RuneStyle, RuneStyleEntry, StatValue } from "@/types/api";
import { getPerkImageUrl } from "@/utils/game";
import { getStyleImageUrl } from "@/utils/styles";
import Image from "next/image";

/* ─── 스탯 퍼크 컬러/약자 맵 (이미지 없으므로 텍스트 fallback) ─── */
const STAT_PERK_VISUAL: Record<number, { color: string; abbr: string }> = {
  5008: { color: "bg-orange-500", abbr: "AD" },
  5005: { color: "bg-yellow-400", abbr: "AS" },
  5007: { color: "bg-blue-400", abbr: "AH" },
  5002: { color: "bg-green-500", abbr: "AR" },
  5003: { color: "bg-purple-400", abbr: "MR" },
  5001: { color: "bg-red-500", abbr: "HP" },
};

/* ─── 데이터 정규화: styles 배열 또는 flat 구조 모두 지원 ─── */
interface NormalizedRunes {
  primaryTreeId: number;
  secondaryTreeId: number;
  primaryRunes: number[]; // 키스톤 + 소룬 3개
  secondaryRunes: number[]; // 소룬 2개
}

function parseRuneStyle(style: RuneStyle | string | null): RuneStyle | null {
  if (!style) return null;

  if (typeof style === "string") {
    try {
      const parsed: unknown = JSON.parse(style);
      // 이중 인코딩: 파싱 결과가 string이면 재귀 파싱
      if (typeof parsed === "string") return parseRuneStyle(parsed);
      // 배열 형태: [{style, selections}, ...] → { styles: [...] } 래핑
      if (Array.isArray(parsed)) return { styles: parsed as RuneStyleEntry[] };
      return parsed as RuneStyle;
    } catch {
      return null;
    }
  }

  // 객체가 실제로 배열인 경우 (타입 시스템 우회)
  if (Array.isArray(style)) return { styles: style as unknown as RuneStyleEntry[] };

  return style;
}

function normalizeRunes(runeStyle: RuneStyle): NormalizedRunes | null {
  // Format A: styles 배열 (selections 포함)
  if (runeStyle.styles && Array.isArray(runeStyle.styles) && runeStyle.styles.length > 0) {
    const primary = runeStyle.styles[0];
    const secondary = runeStyle.styles.length > 1 ? runeStyle.styles[1] : null;
    return {
      primaryTreeId: primary.style,
      secondaryTreeId: secondary?.style ?? 0,
      primaryRunes: primary.selections.map((s) => s.perk),
      secondaryRunes: secondary?.selections.map((s) => s.perk) ?? [],
    };
  }

  // Format B: flat 구조 (primaryRuneId + primaryRuneIds)
  if (runeStyle.primaryRuneId && runeStyle.primaryRuneIds) {
    return {
      primaryTreeId: runeStyle.primaryRuneId,
      secondaryTreeId: runeStyle.secondaryRuneId ?? 0,
      primaryRunes: runeStyle.primaryRuneIds,
      secondaryRunes: runeStyle.secondaryRuneIds ?? [],
    };
  }

  // Format C: flat 구조 (primaryStyleId + primaryPerk0~3)
  if (runeStyle.primaryStyleId && runeStyle.primaryPerk0 !== undefined) {
    return {
      primaryTreeId: runeStyle.primaryStyleId,
      secondaryTreeId: runeStyle.subStyleId ?? 0,
      primaryRunes: [
        runeStyle.primaryPerk0,
        runeStyle.primaryPerk1,
        runeStyle.primaryPerk2,
        runeStyle.primaryPerk3,
      ].filter((p): p is number => p !== undefined),
      secondaryRunes: [
        runeStyle.subPerk0,
        runeStyle.subPerk1,
      ].filter((p): p is number => p !== undefined),
    };
  }

  logger.warn("normalizeRunes 매칭 실패", {
    error: `알 수 없는 RuneStyle 구조: keys=${Object.keys(runeStyle).join(",")}`,
  });
  return null;
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
        className={`${sizeClass} rounded-full overflow-hidden relative bg-surface-8 ${isSelected
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

  // 스토어 데이터에서 keystones/rows 구성
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
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-opacity ${isSelected
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

/* ─── 메인 컴포넌트 ─── */
interface RuneSetupProps {
  style: RuneStyle | string | null;
  statValue?: StatValue | null;
}

export default function RuneSetup({ style, statValue }: RuneSetupProps) {
  const runeStyle = parseRuneStyle(style);
  const runes = runeStyle ? normalizeRunes(runeStyle) : null;

  if (!runes) {
    return (
      <div className="text-on-surface-medium text-[11px]">룬 정보 없음</div>
    );
  }

  const allSelectedIds = new Set([...runes.primaryRunes, ...runes.secondaryRunes]);

  return (
    <div className="flex items-start justify-center gap-0">
      {/* ─── 메인 트리 ─── */}
      {runes.primaryTreeId > 0 && (
        <RuneTreeSection
          treeId={runes.primaryTreeId}
          selectedPerkIds={allSelectedIds}
          isPrimary
        />
      )}

      {/* ─── 구분선 ─── */}
      <div className="w-px self-stretch bg-divider/30 mx-3" />

      {/* ─── 보조 트리 ─── */}
      {runes.secondaryTreeId > 0 && (
        <>
          <RuneTreeSection
            treeId={runes.secondaryTreeId}
            selectedPerkIds={allSelectedIds}
            isPrimary={false}
          />
          <div className="w-px self-stretch bg-divider/30 mx-3" />
        </>
      )}

      {/* ─── 스탯 파편 ─── */}
      {statValue && (
        <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
          <span className="text-[9px] text-on-surface-medium mb-0.5">
            스탯
          </span>
          {STAT_PERK_ROWS.map((row, rowIdx) => {
            const key = STAT_PERK_ROW_KEYS[rowIdx];
            const selectedId =
              statValue[key] !== undefined ? Number(statValue[key]) : 0;
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
      )}
    </div>
  );
}
