"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/auth";
import { useBookmarkToggle } from "@/entities/community";

interface BookmarkButtonProps {
  postId: number;
  bookmarked: boolean;
}

export default function BookmarkButton({
  postId,
  bookmarked,
}: BookmarkButtonProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { toggle } = useBookmarkToggle(postId);

  const handleClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    void toggle();
  };

  // 요청 중이라고 버튼을 잠그지 않는다. 디바운스로 요청은 한 번만 나가므로
  // 잠글 이유가 없고, 잠그면 되돌리려는 클릭까지 막혀 오히려 답답해진다.
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={bookmarked}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
        bookmarked
          ? "bg-primary/20 text-primary border border-primary/50"
          : "bg-surface-4 hover:bg-surface-8 border border-divider text-on-surface-medium"
      }`}
    >
      <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
      {bookmarked ? "저장됨" : "저장"}
    </button>
  );
}
