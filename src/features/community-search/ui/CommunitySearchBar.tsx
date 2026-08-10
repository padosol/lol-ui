"use client";

import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_SEARCH_SCOPE,
  SEARCH_SCOPES,
  type SearchScope,
} from "../model/searchScope";

interface CommunitySearchBarProps {
  onSearch: (keyword: string, scope: SearchScope) => void;
}

export default function CommunitySearchBar({ onSearch }: CommunitySearchBarProps) {
  const t = useTranslations("community");
  const tScope = useTranslations("community.search");
  const [value, setValue] = useState("");
  const [scope, setScope] = useState<SearchScope>(DEFAULT_SEARCH_SCOPE);
  const [scopeOpen, setScopeOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) {
      setScopeOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed, scope);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center rounded-lg border border-divider bg-surface-4 focus-within:border-primary transition-colors"
    >
      <div ref={scopeRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setScopeOpen((v) => !v)}
          className="flex items-center gap-1 rounded-l-lg py-2 pl-3 pr-2 text-[13px] font-medium text-on-surface-medium hover:text-on-surface cursor-pointer focus:outline-none whitespace-nowrap"
          aria-haspopup="listbox"
          aria-expanded={scopeOpen}
          aria-label={tScope("scopeSelect")}
        >
          {tScope(scope)}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${scopeOpen ? "rotate-180" : ""}`}
          />
        </button>
        {scopeOpen && (
          <div className="absolute top-full left-0 mt-1 min-w-[120px] bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="py-1" role="listbox" aria-label={tScope("scopeSelect")}>
              {SEARCH_SCOPES.map((option) => {
                const selected = option === scope;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setScope(option);
                      setScopeOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-sm whitespace-nowrap transition-colors cursor-pointer ${
                      selected
                        ? "bg-surface-8 text-on-surface font-medium"
                        : "text-on-surface hover:bg-surface-8"
                    }`}
                    role="option"
                    aria-selected={selected}
                  >
                    {tScope(option)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <span className="h-4 w-px shrink-0 bg-divider" />

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none"
      />

      <button
        type="submit"
        aria-label={t("searchPlaceholder")}
        className="shrink-0 px-3 py-2 text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
