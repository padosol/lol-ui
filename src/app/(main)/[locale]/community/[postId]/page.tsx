import { notFound, permanentRedirect } from "next/navigation";
import { getPathname } from "@/shared/i18n/navigation";
import { toLocale } from "@/shared/i18n/locale";
import { postHref } from "@/entities/community";

interface Props {
  params: Promise<{ locale: string; postId: string }>;
}

/**
 * 게시글 경로가 /community/{id} 에서 /community/board/detail/{id} 로 옮겨갔다.
 * 이미 공유되거나 색인된 링크가 있어 영구 리다이렉트로 넘겨준다.
 *
 * 이 라우트는 /community/board 보다 뒤에 매칭된다(정적 세그먼트 우선)。
 */
export default async function LegacyPostRedirect({ params }: Props) {
  const { locale, postId } = await params;

  const id = Number(postId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  permanentRedirect(
    getPathname({ href: postHref(id), locale: toLocale(locale) })
  );
}
