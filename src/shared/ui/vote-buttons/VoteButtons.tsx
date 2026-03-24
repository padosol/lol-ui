"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteButtonsProps {
  upvoteCount: number;
  downvoteCount: number;
  currentUserVote?: "UPVOTE" | "DOWNVOTE" | null;
  onVote: (voteType: "UPVOTE" | "DOWNVOTE") => void;
  isPending?: boolean;
  size?: "sm" | "md";
}

export default function VoteButtons({
  upvoteCount,
  downvoteCount,
  currentUserVote,
  onVote,
  isPending = false,
  size = "md",
}: VoteButtonsProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onVote("UPVOTE")}
        disabled={isPending}
        className={`flex items-center gap-1 ${padding} rounded-md ${textSize} font-medium transition-colors disabled:opacity-50 ${
          currentUserVote === "UPVOTE"
            ? "bg-primary/20 text-primary border border-primary/50"
            : "bg-surface-4 hover:bg-surface-8 border border-divider text-on-surface-medium"
        }`}
      >
        <ThumbsUp className={iconSize} />
        {upvoteCount}
      </button>
      <button
        type="button"
        onClick={() => onVote("DOWNVOTE")}
        disabled={isPending}
        className={`flex items-center gap-1 ${padding} rounded-md ${textSize} font-medium transition-colors disabled:opacity-50 ${
          currentUserVote === "DOWNVOTE"
            ? "bg-red-500/20 text-red-400 border border-red-500/50"
            : "bg-surface-4 hover:bg-surface-8 border border-divider text-on-surface-medium"
        }`}
      >
        <ThumbsDown className={iconSize} />
        {downvoteCount}
      </button>
    </div>
  );
}
