import GameTooltip from "@/components/tooltip/GameTooltip";
import { KEYSTONE_NAMES, RUNE_TREE_NAMES } from "@/constants/runes";
import type { RuneStyle } from "@/types/api";
import { getPerkImageUrl } from "@/utils/game";
import { getStyleImageUrl } from "@/utils/styles";
import Image from "next/image";

function parseRuneStyle(style: RuneStyle | string | null): RuneStyle | null {
  if (!style) return null;
  if (typeof style === "string") {
    try {
      return JSON.parse(style) as RuneStyle;
    } catch {
      return null;
    }
  }
  return style;
}

export default function RuneSetup({ style }: { style: RuneStyle | string | null }) {
  const runeStyle = parseRuneStyle(style);

  if (!runeStyle || !runeStyle.styles || runeStyle.styles.length === 0) {
    return (
      <div className="text-on-surface-medium text-[11px]">
        룬 정보 없음
      </div>
    );
  }

  const primaryStyle = runeStyle.styles[0];
  const secondaryStyle = runeStyle.styles.length > 1 ? runeStyle.styles[1] : null;

  const primaryTreeName =
    RUNE_TREE_NAMES[primaryStyle.style] || `트리 ${primaryStyle.style}`;
  const secondaryTreeName = secondaryStyle
    ? RUNE_TREE_NAMES[secondaryStyle.style] || `트리 ${secondaryStyle.style}`
    : null;

  return (
    <div className="flex gap-6">
      {/* 메인 트리 */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          {primaryStyle.style > 0 && (
            <div className="w-5 h-5 relative shrink-0">
              <Image
                src={getStyleImageUrl(primaryStyle.style)}
                alt={primaryTreeName}
                fill
                sizes="20px"
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          <span className="text-[10px] text-on-surface font-semibold">
            {primaryTreeName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {primaryStyle.selections.map((sel, idx) => {
            const isKeystone = idx === 0;
            const size = isKeystone ? "w-8 h-8" : "w-6 h-6";
            const imgSize = isKeystone ? "32px" : "24px";
            return (
              <GameTooltip key={idx} type="rune" id={sel.perk} disabled={sel.perk <= 0}>
                <div
                  className={`${size} rounded-full overflow-hidden relative bg-surface-8 ${isKeystone ? "ring-1 ring-gold/50" : ""
                    }`}
                >
                  {sel.perk > 0 && (
                    <Image
                      src={getPerkImageUrl(sel.perk)}
                      alt={KEYSTONE_NAMES[sel.perk] || `Rune ${sel.perk}`}
                      fill
                      sizes={imgSize}
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
              </GameTooltip>
            );
          })}
        </div>
      </div>

      {/* 서브 트리 */}
      {secondaryStyle && (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            {secondaryStyle.style > 0 && (
              <div className="w-5 h-5 relative shrink-0">
                <Image
                  src={getStyleImageUrl(secondaryStyle.style)}
                  alt={secondaryTreeName || ""}
                  fill
                  sizes="20px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <span className="text-[10px] text-on-surface font-semibold">
              {secondaryTreeName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {secondaryStyle.selections.map((sel, idx) => (
              <GameTooltip key={idx} type="rune" id={sel.perk} disabled={sel.perk <= 0}>
                <div className="w-6 h-6 rounded-full overflow-hidden relative bg-surface-8">
                  {sel.perk > 0 && (
                    <Image
                      src={getPerkImageUrl(sel.perk)}
                      alt={KEYSTONE_NAMES[sel.perk] || `Rune ${sel.perk}`}
                      fill
                      sizes="24px"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
              </GameTooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
