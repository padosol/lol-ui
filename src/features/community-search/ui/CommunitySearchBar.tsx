"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface CommunitySearchBarProps {
  onSearch: (keyword: string) => void;
}

export default function CommunitySearchBar({ onSearch }: CommunitySearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="게시글 검색..."
        className="w-full bg-surface-4 border border-divider rounded-md pl-3 pr-10 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
