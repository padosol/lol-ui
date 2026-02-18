import { AVAILABLE_REGIONS, type RegionValue } from "@/stores/useRegionStore";
import { ChevronDown } from "lucide-react";

interface RegionSelectorProps {
  region: RegionValue;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (region: RegionValue) => void;
  regionRef: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}

export default function RegionSelector({
  region,
  isOpen,
  onToggle,
  onSelect,
  regionRef,
  compact = false,
}: RegionSelectorProps) {
  const currentRegion = AVAILABLE_REGIONS.find((o) => o.value === region);

  return (
    <div ref={regionRef} className="relative flex">
      <button
        type="button"
        onClick={onToggle}
        className={`relative bg-surface-4 hover:bg-surface-8 border border-r border-divider font-medium text-sm text-on-surface cursor-pointer focus:outline-none h-full flex items-center gap-2 ${
          compact
            ? "px-2 py-1.5 pr-7 rounded-l-md min-w-[60px]"
            : "px-3 py-2.5 pr-10 rounded-l-lg min-w-[96px]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          {compact ? (
            <span className="text-on-surface text-xs">
              {currentRegion?.subLabel ?? region.toUpperCase()}
            </span>
          ) : (
            <>
              <span className="text-on-surface">
                {currentRegion?.label ?? region}
              </span>
              <span className="text-[10px] text-on-surface-medium">
                {currentRegion?.subLabel ?? region}
              </span>
            </>
          )}
        </span>
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-medium transition-transform ${
            compact ? "w-3 h-3" : "w-4 h-4"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden min-w-[96px]">
          <div className="py-1" role="listbox" aria-label="리전 선택">
            {AVAILABLE_REGIONS.map((opt) => {
              const selected = opt.value === region;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    selected
                      ? "bg-surface-8 text-on-surface"
                      : "text-on-surface hover:bg-surface-8"
                  }`}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-on-surface-medium">
                    {opt.subLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
