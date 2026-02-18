import type { SummonerAutocompleteItem } from "@/types/api";
import { getProfileIconImageUrl } from "@/utils/profile";
import { getTierColor, getTierImageUrl, getTierInitial } from "@/utils/tier";
import Image from "next/image";

interface AutocompleteDropdownProps {
  results: SummonerAutocompleteItem[];
  isLoading: boolean;
  onSelect: (item: SummonerAutocompleteItem) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function AutocompleteDropdown({
  results,
  isLoading,
  onSelect,
  dropdownRef,
}: AutocompleteDropdownProps) {
  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-surface-4 border border-divider rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      {isLoading ? (
        <div className="p-4 text-center text-on-surface-medium">검색 중...</div>
      ) : results.length > 0 ? (
        <div className="py-1">
          {results.map((item, index) => {
            const uniqueKey = item.tagLine
              ? `${item.gameName}-${item.tagLine}-${index}`
              : `${item.gameName}-${index}`;
            return (
              <button
                key={uniqueKey}
                onClick={() => onSelect(item)}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-surface-8 transition-colors text-left cursor-pointer"
              >
                {/* 프로필 아이콘 */}
                <div className="w-8 h-8 bg-surface-8 rounded-lg overflow-hidden relative shrink-0">
                  {item.profileIconId ? (
                    <Image
                      src={getProfileIconImageUrl(item.profileIconId)}
                      alt="Profile Icon"
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-lg flex items-center justify-center w-full h-full">
                      👤
                    </span>
                  )}
                </div>

                {/* 기본 정보 */}
                <div className="flex-1 min-w-0 flex flex-row items-center gap-2">
                  <div className="text-on-surface font-medium text-sm truncate">
                    {item.gameName}
                    {item.tagLine && (
                      <span className="text-on-surface-medium ml-1">
                        #{item.tagLine}
                      </span>
                    )}
                  </div>
                  {item.summonerLevel && (
                    <div className="text-on-surface-medium text-xs">
                      레벨 {item.summonerLevel}
                    </div>
                  )}
                </div>

                {/* 티어 정보 */}
                {item.tier && item.rank && (
                  <div className="flex flex-row items-center gap-2 shrink-0">
                    <div className="w-10 h-10 bg-surface-4 rounded-lg overflow-hidden relative">
                      {getTierImageUrl(item.tier) ? (
                        <Image
                          src={getTierImageUrl(item.tier)}
                          alt={`${item.tier} 티어`}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-linear-to-br ${getTierColor(
                            item.tier
                          )} flex items-center justify-center`}
                        >
                          <span className="text-on-surface text-xs font-bold">
                            {getTierInitial(item.tier)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="text-on-surface text-xs font-semibold">
                        {item.tier} {item.rank}
                      </div>
                      {item.leaguePoints !== null && (
                        <div className="text-on-surface-medium text-xs">
                          {item.leaguePoints}LP
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-on-surface-medium">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
