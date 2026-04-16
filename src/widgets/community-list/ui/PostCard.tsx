"use client";

import type { PostListItem } from "@/entities/community";
import { POST_CATEGORY_LABELS } from "@/entities/community";
import { Eye, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { getRelativeTime } from "@/shared/lib/date";

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const netVotes = post.upvoteCount - post.downvoteCount;

  return (
    <Link
      href={`/community/${post.id}`}
      className="block bg-surface-1 border border-divider rounded-lg p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-medium">
          {POST_CATEGORY_LABELS[post.category]}
        </span>
        <span className="text-xs text-on-surface-disabled">
          {getRelativeTime(post.createdAt)}
        </span>
      </div>

      <h3 className="text-sm font-medium text-on-surface mb-3 line-clamp-1">
        {post.title}
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-disabled">
          {post.author.nickname}
        </span>
        <div className="flex items-center gap-3 text-xs text-on-surface-disabled">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {netVotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
