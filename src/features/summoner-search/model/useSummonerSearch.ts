"use client";

import { searchSummonerAutocomplete } from "@/entities/summoner";
import { useRegionStore } from "@/features/region-select";
import type { SummonerAutocompleteItem } from "@/entities/summoner";
import { useRouter } from "@/shared/i18n/navigation";
import { useEffect, useRef, useState } from "react";

export function useSummonerSearch() {
  const router = useRouter();
  const { region, setRegion } = useRegionStore();
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [summonerName, setSummonerName] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    SummonerAutocompleteItem[]
  >([]);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const trimmedName = summonerName.trim();

    if (trimmedName.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoadingAutocomplete(true);
      try {
        const results = await searchSummonerAutocomplete(trimmedName, region);
        setAutocompleteResults(results);
        setShowAutocomplete(results.length > 0);
      } catch (error) {
        // eslint-disable-next-line no-restricted-syntax -- 개발자 로그, 사용자 노출 아님
        console.error("자동완성 검색 오류:", error);
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      } finally {
        setIsLoadingAutocomplete(false);
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [summonerName, region]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        regionRef.current &&
        !regionRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }

      if (
        regionRef.current &&
        !regionRef.current.contains(event.target as Node)
      ) {
        setIsRegionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = summonerName.trim();
    if (trimmedName) {
      const encodedName = encodeURIComponent(trimmedName);
      router.push(`/summoners/${region}/${encodedName}`);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (item: SummonerAutocompleteItem) => {
    const gameName = item.tagLine
      ? `${item.gameName}-${item.tagLine}`
      : item.gameName;
    const encodedName = encodeURIComponent(gameName);
    router.push(`/summoners/${region}/${encodedName}`);
    setShowAutocomplete(false);
    justSelectedRef.current = true;
    setSummonerName(gameName);
  };

  return {
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
  };
}
