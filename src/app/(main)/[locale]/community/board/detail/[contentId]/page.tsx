import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { parseListOrigin, parsePostSort } from "@/entities/community";
import { CommunityDetailPageClient } from "@/views/community";
import {
  loadCategoryTree,
  loadPostDetail,
} from "@/views/community/lib/loadCommunityData";

interface Props {
  params: Promise<{ locale: string; contentId: string }>;
  /**
   * 목록에서 넘어왔다면 그때의 정렬과 출처 게시판. 글 아래 목록이 같은 목록을
   * 같은 순서로 잇는다.
   */
  searchParams: Promise<{ sort?: string; from?: string }>;
}

/**
 * 조회수·투표가 실시간으로 바뀌고, SSR 이 로그인 쿠키로 개인화(내 투표·북마크)해
 * HTML 이 사용자마다 달라서 캐시하지 않는다.
 */
export const dynamic = "force-dynamic";

/** 메타 설명은 검색결과에서 잘리는 길이에 맞춘다. 본문은 평문이라 개행만 눌러주면 된다. */
const DESCRIPTION_LENGTH = 160;

function toDescription(content: string, fallback: string): string {
  const flattened = content.replace(/\s+/g, " ").trim();
  if (!flattened) return fallback;
  return flattened.length > DESCRIPTION_LENGTH
    ? `${flattened.slice(0, DESCRIPTION_LENGTH - 1)}…`
    : flattened;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, contentId } = await params;
  const postId = Number(contentId);
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.community" });
  const alternates = localeAlternates(locale, `/community/board/detail/${contentId}`);

  if (!Number.isInteger(postId) || postId <= 0) {
    return { title: t("title"), description: t("description"), alternates };
  }

  try {
    const post = await loadPostDetail(postId);
    const title = `${post.title} | ${t("title")}`;
    const description = toDescription(post.content, t("description"));

    return {
      title,
      description,
      alternates,
      openGraph: {
        title,
        description,
        type: "article",
        siteName: "METAPICK",
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.author.nickname],
      },
      twitter: { card: "summary", title, description },
    };
  } catch {
    // 삭제됐거나 백엔드가 응답하지 않는 경우. 본문 렌더에서 notFound 로 정리된다.
    return { title: t("title"), description: t("description"), alternates };
  }
}

export default async function CommunityDetailPage({
  params,
  searchParams,
}: Readonly<Props>) {
  const { locale, contentId } = await params;
  setRequestLocale(toLocale(locale));

  const { sort, from } = await searchParams;
  const listSort = parsePostSort(sort);
  const listFrom = parseListOrigin(from);

  const postId = Number(contentId);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  // generateMetadata 가 이미 받아온 글을 요청 스코프 캐시에서 그대로 꺼내 화면까지
  // 내려보낸다. 넘기지 않으면 클라이언트가 같은 글을 한 번 더 받아가므로, 불필요한
  // 재요청을 막기 위해 넘긴다. (조회수는 이 GET 이 아니라 화면이 보내는
  // `POST …/views` 가 센다)
  //
  // 백엔드가 응답하지 않으면 초기 데이터 없이 넘긴다. 화면이 클라이언트 조회로
  // 다시 시도하고, 그래도 실패하면 "글을 찾을 수 없음"으로 정리된다.
  //
  // 게시판 트리는 좌측 메뉴 때문에 함께 받는다. 목록 화면과 달리 여기서는
  // 트리가 없어도 본문이 성립하므로, 실패해도 500 대신 클라이언트 재시도에 맡긴다.
  const [initialPost, initialTree] = await Promise.all([
    loadPostDetail(postId).catch(() => undefined),
    loadCategoryTree(locale).catch(() => undefined),
  ]);

  return (
    <CommunityDetailPageClient
      postId={postId}
      sort={listSort}
      from={listFrom}
      initialPost={initialPost}
      initialTree={initialTree}
    />
  );
}
