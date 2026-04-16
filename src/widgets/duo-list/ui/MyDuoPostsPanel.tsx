"use client";

import { useMyDuoPosts } from "@/entities/duo";
import type { DuoPost } from "@/entities/duo";
import DuoCard from "./DuoCard";

interface MyDuoPostsPanelProps {
  onSelectPost: (postId: number) => void;
}

export default function MyDuoPostsPanel({
  onSelectPost,
}: MyDuoPostsPanelProps) {
  const { data, isLoading } = useMyDuoPosts();
  const posts = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-1 border border-divider rounded-lg p-3 animate-pulse h-[52px]"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        작성한 게시글이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <DuoCard key={post.id} post={post} onSelect={onSelectPost} />
      ))}
    </div>
  );
}
