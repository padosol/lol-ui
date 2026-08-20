"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { CommunityShell } from "@/widgets/community-shell";
import { BoardListSection } from "@/widgets/community-list";
import { PostDetailPanel } from "@/widgets/community-detail";
import { usePostDetail } from "@/entities/community";
import type { CategoryTree, Post, PostSort } from "@/entities/community";

interface CommunityDetailPageClientProps {
  postId: number;
  /** 목록에서 넘어올 때의 정렬. 아래 목록이 그 순서를 잇는다. */
  sort: PostSort;
  /**
   * 목록에서 넘어올 때의 출처 게시판(URL 의 `?from=`). 전체에서 들어왔으면
   * "ALL" 이고, 그 외에는 없다 — 게시판에서 들어왔다면 글의 소속 게시판이 곧
   * 출처라 URL 없이도 알 수 있다.
   */
  from?: "ALL";
  /** 서버가 이미 받아온 글. 넘어오면 클라이언트가 같은 글을 다시 받지 않는다. */
  initialPost?: Post;
  /** 서버가 실어 보낸 게시판 트리. 없으면 사이드바가 스켈레톤부터 시작한다. */
  initialTree?: CategoryTree;
}

export default function CommunityDetailPageClient({
  postId,
  sort,
  from,
  initialPost,
  initialTree,
}: Readonly<CommunityDetailPageClientProps>) {
  // 셸(사이드바 활성 표시)과 하단 목록이 글의 소속 게시판을 알아야 한다.
  // PostDetailPanel 이 부르는 것과 같은 쿼리라 조회가 늘지 않는다 — 이 화면에서
  // 상세를 한 번 더 받으면 그대로 조회수 +1 이므로 키를 공유하는 것이 중요하다.
  const { data: post } = usePostDetail(postId, initialPost);

  // 이 화면이 이어가는 목록. 전체에서 들어왔으면 전체를 그대로 잇고, 아니면
  // 글이 속한 게시판을 잇는다. 좌측 메뉴의 활성 표시도 같은 값을 따라간다.
  const board = from ?? post?.categoryId;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommunityShell
          activeCategory={board ?? "ALL"}
          initialTree={initialTree}
          showAside
        >
          <PostDetailPanel postId={postId} initialPost={initialPost} />

          {/* 글을 못 받았으면 어느 목록을 이을지 알 수 없어 목록도 걸지 않는다 */}
          {board !== undefined && (
            <BoardListSection
              board={board}
              currentPostId={postId}
              sort={sort}
            />
          )}
        </CommunityShell>
      </div>
      <Footer />
    </div>
  );
}
