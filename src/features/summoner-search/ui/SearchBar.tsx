"use client";

import { useSummonerSearch } from "../model/useSummonerSearch";
import { Search } from "lucide-react";
import AutocompleteDropdown from "./AutocompleteDropdown";
import RegionSelector from "./RegionSelector";

interface SearchBarProps {
  variant?: "full" | "compact";
}

export default function SearchBar({ variant = "full" }: SearchBarProps) {
  const {
    region,
    setRegion,
    isRegionOpen,
    setIsRegionOpen,
    summonerName,
    setSummonerName,
    autocompleteResults,
    isLoadingAutocomplete,
    showAutocomplete,
    setShowAutocomplete,
    handleSearch,
    handleAutocompleteSelect,
    autocompleteRef,
    inputRef,
    regionRef,
  } = useSummonerSearch();

  const isCompact = variant === "compact";

  return (
    <form
      onSubmit={handleSearch}
      className={`flex gap-0 items-stretch relative ${isCompact ? "w-full max-w-xl" : "w-full"
        }`}
    >
      <RegionSelector
        region={region}
        isOpen={isRegionOpen}
        onToggle={() => setIsRegionOpen((v) => !v)}
        onSelect={(value) => {
          setRegion(value);
          setIsRegionOpen(false);
        }}
        regionRef={regionRef}
        compact={isCompact}
      />

      <div className="flex-1 relative flex">
        <input
          ref={inputRef}
          type="text"
          value={summonerName}
          onChange={(e) => {
            setSummonerName(e.target.value);
            if (e.target.value.trim().length >= 2) {
              setShowAutocomplete(true);
            }
          }}
          onFocus={() => {
            if (autocompleteResults.length > 0) {
              setShowAutocomplete(true);
            }
          }}
          placeholder={"소환사 명 + #KR1"}
          className={`w-full bg-surface-4 border border-divider border-l-0 border-r-0 text-on-surface placeholder-on-surface-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-full ${isCompact
              ? "px-2 py-1.5 text-sm"
              : "px-4 py-3 pr-12"
            }`}
        />

      </div>

      <button
        type="submit"
        className={`bg-primary hover:bg-primary/90 text-on-surface flex items-center justify-center border border-l-0 border-primary h-full ${isCompact
            ? "px-2.5 py-1.5 rounded-r-md"
            : "px-6 py-3 rounded-r-lg"
          }`}
      >
        <Search className={isCompact ? "w-3.5 h-3.5" : "w-5 h-5"} />
      </button>

      {showAutocomplete && (
        <AutocompleteDropdown
          results={autocompleteResults}
          isLoading={isLoadingAutocomplete}
          onSelect={handleAutocompleteSelect}
          dropdownRef={autocompleteRef}
          compact={isCompact}
        />
      )}
    </form>
  );
}
