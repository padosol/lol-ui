"use client";

import { useState } from "react";
import { BookmarkX } from "lucide-react";
import { PostCard, useMyBookmarks, useRemoveBookmark } from "@/entities/community";
import { toast } from "@/shared/ui/toast";
import { useTranslations } from "next-intl";
import MypagePostList from "./MypagePostList";

export default function BookmarksSection() {
  const t = useTranslations("mypage.bookmarks");
  const [page, setPage] = useState(0);
  const query = useMyBookmarks(page);
  const removeMutation = useRemoveBookmark();

  const handleRemove = (postId: number) => {
    removeMutation.mutate(postId, {
      onError: () => toast.error(t("removeError")),
    });
  };

  return (
    <MypagePostList
      namespace="mypage.bookmarks"
      page={page}
      onPageChange={setPage}
      query={query}
      renderPost={(post) => (
        /* 해제 버튼은 PostCard(<Link>) 안이 아니라 형제로 둔다.
           링크 안에 버튼을 중첩하면 클릭이 서로 먹고 stopPropagation 에 의존하게 된다. */
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <PostCard post={post} />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(post.id)}
            disabled={removeMutation.isPending}
            aria-label={t("remove")}
            title={t("remove")}
            className="shrink-0 p-2 mt-1 rounded-md text-on-surface-disabled hover:text-error hover:bg-surface-4 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <BookmarkX className="w-4 h-4" />
          </button>
        </div>
      )}
    />
  );
}
