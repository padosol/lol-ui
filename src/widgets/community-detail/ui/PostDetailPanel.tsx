"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Share2 } from "lucide-react";
import {
  usePostDetail,
  useDeletePost,
  useVote,
  useRemoveVote,
  useCategoryLabel,
  AuthorAvatar,
  PostContent,
  postEditHref,
} from "@/entities/community";
import type { Post, VoteType } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { VoteButtons } from "@/shared/ui/vote-buttons";
import { BookmarkButton } from "@/features/community-bookmark";
import { ConfirmModal } from "@/shared/ui/modal";
import { toast } from "@/shared/ui/toast";
import { useFormatter, useTranslations } from "next-intl";
import CommentSection from "./CommentSection";

interface PostDetailPanelProps {
  postId: number;
  /** 서버가 이미 받아온 글. 있으면 첫 렌더에서 다시 받지 않는다. */
  initialPost?: Post;
}

export default function PostDetailPanel({
  postId,
  initialPost,
}: Readonly<PostDetailPanelProps>) {
  const format = useFormatter();
  const t = useTranslations("community");
  const tPost = useTranslations("community.post");
  const tCommon = useTranslations("common");
  // 게시글 본문 로딩이 보통 더 오래 걸려 라벨은 그 전에 도착한다. 라벨이 늦어도
  // 배지 자리만 잠깐 비므로 목록 배지와 달리 빈 문자열 처리를 하지 않는다.
  const categoryLabel = useCategoryLabel();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: post, isLoading, error, refetch } = usePostDetail(postId, initialPost);
  const deleteMutation = useDeletePost();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const voteMutation = useVote(postId);
  const removeVoteMutation = useRemoveVote(postId);

  // 서버 조회에는 인증이 실리지 않아 초기 데이터의 투표·북마크 표시가 비어 있다.
  // 로그인 상태일 때만 한 번 더 받아 채운다(비로그인 방문·크롤러는 조회가 한 번으로 끝난다).
  const hasInitialPost = !!initialPost;
  const userId = user?.id;
  useEffect(() => {
    if (!hasInitialPost || !userId) return;
    refetch();
  }, [hasInitialPost, userId, refetch]);

  const isAuthor = user?.id === post?.author.id;
  const isVotePending = voteMutation.isPending || removeVoteMutation.isPending;

  const handleVote = (voteType: VoteType) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!post) return;

    if (post.currentUserVote === voteType) {
      removeVoteMutation.mutate({ targetType: "POST", targetId: post.id });
    } else {
      voteMutation.mutate({ targetType: "POST", targetId: post.id, voteType });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("shareCopied"));
    } catch {
      toast.error(t("shareError"));
    }
  };

  const confirmDelete = () => {
    if (!post) return;
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push("/community");
      },
      onError: () => toast.error(tPost("deleteError")),
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        {t("loading")}
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        {tPost("notFound")}
      </div>
    );
  }

  const netVotes = post.upvoteCount - post.downvoteCount;

  return (
    <div className="flex flex-col gap-4">
      <article className="bg-surface-1 border border-divider rounded-xl px-5 py-6 sm:px-8 sm:py-7">
        <div className="mb-3">
          <span className="rounded bg-primary/15 px-2 py-1 text-[11.5px] font-bold text-primary">
            {categoryLabel(post.categoryId)}
          </span>
        </div>

        <h1 className="mb-4 text-xl sm:text-[26px] font-bold leading-snug tracking-tight text-on-surface">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5 border-b border-divider pb-4">
          <AuthorAvatar nickname={post.author.nickname} />
          <span className="text-sm font-bold text-on-surface">
            {post.author.nickname}
          </span>
          <div className="flex-1" />
          <span className="text-xs text-on-surface-disabled">
            {format.dateTime(new Date(post.createdAt), {
              dateStyle: "long",
              timeStyle: "short",
            })}
            {post.updatedAt !== post.createdAt && ` ${tPost("edited")}`}
            {" · "}
            {tPost("viewCount", { count: post.viewCount })}
            {" · "}
            {tPost("upvoteCount", { count: netVotes })}
          </span>
        </div>

        {/* 3단 그리드에서는 카드가 넓어지므로 본문만 읽기 좋은 폭으로 묶는다 */}
        <div className="max-w-[760px]">
          <PostContent content={post.content} />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-4">
          <VoteButtons
            upvoteCount={post.upvoteCount}
            downvoteCount={post.downvoteCount}
            currentUserVote={post.currentUserVote}
            onVote={handleVote}
            isPending={isVotePending}
          />
          <BookmarkButton
            postId={post.id}
            bookmarked={post.currentUserBookmarked}
          />
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 rounded-md border border-divider bg-surface-4 hover:bg-surface-8 px-3 py-1.5 text-sm font-medium text-on-surface-medium transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {t("share")}
          </button>

          {/*
            글쓴이 몫의 조작은 같은 줄 반대쪽 끝에 모은다. 여백 대신 ml-auto 를
            쓰는 건 좁은 화면에서 줄이 접혀도 오른쪽에 붙어 있게 하려는 것이다.
          */}
          {isAuthor && (
            <div className="ml-auto flex gap-1.5">
              <button
                type="button"
                onClick={() => router.push(postEditHref(post.id))}
                className="flex items-center gap-1 rounded-md border border-divider px-3 py-1.5 text-sm font-medium text-on-surface-medium hover:bg-surface-8 hover:text-on-surface transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                {tCommon("edit")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 rounded-md border border-divider px-3 py-1.5 text-sm font-medium text-on-surface-medium hover:border-loss/50 hover:bg-loss/10 hover:text-loss transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {tCommon("delete")}
              </button>
            </div>
          )}
        </div>
      </article>

      <CommentSection postId={post.id} commentCount={post.commentCount} />

      {/*
        예전에 여기 있던 "목록으로" 버튼은 뺐다. 이 아래에 같은 게시판의 글
        목록이 바로 이어지므로 목록으로 되돌아갈 이유가 없다.
      */}

      <ConfirmModal
        open={deleteOpen}
        title={tPost("deleteTitle")}
        description={tPost("deleteDescription")}
        confirmLabel={tCommon("delete")}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
