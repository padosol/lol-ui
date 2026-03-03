import { logger } from "@/shared/lib/logger";
import type { RuneStyle, RuneStyleEntry } from "@/entities/match/types";

export interface NormalizedRunes {
  primaryTreeId: number;
  secondaryTreeId: number;
  primaryRunes: number[];
  secondaryRunes: number[];
}

export function parseRuneStyle(style: RuneStyle | string | null): RuneStyle | null {
  if (!style) return null;

  if (typeof style === "string") {
    try {
      const parsed: unknown = JSON.parse(style);
      if (typeof parsed === "string") return parseRuneStyle(parsed);
      if (Array.isArray(parsed)) return { styles: parsed as RuneStyleEntry[] };
      return parsed as RuneStyle;
    } catch {
      return null;
    }
  }

  if (Array.isArray(style)) return { styles: style as unknown as RuneStyleEntry[] };

  return style;
}

export function normalizeRunes(runeStyle: RuneStyle | null): NormalizedRunes | null {
  if (!runeStyle) return null;

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
