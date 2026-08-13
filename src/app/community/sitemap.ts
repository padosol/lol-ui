import { MetadataRoute } from "next";
import { serverApiClient } from "@/shared/api/server-client";
import {
  getCategoryTree,
  getPosts,
  categoryCodeToSlug,
} from "@/entities/community";
import { DEFAULT_LOCALE } from "@/shared/i18n/locale";
import { localizedSitemapEntries } from "@/shared/i18n/sitemap";
import { logger } from "@/shared/lib/logger";

/**
 * 사이트맵에 실을 게시글 페이지 수. 한 페이지가 20개 안팎이라 최근 몇백 건이
 * 담긴다. 오래된 글까지 전부 넣으면 사이트맵만 커지고 크롤링 예산을 나눠 먹는다 —
 * 깊은 글은 목록·게시판 링크를 타고 발견되게 둔다.
 */
const POST_PAGES = 5;

/**
 * 게시글이 계속 쌓이므로 빌드 시점에 고정하면 새 글이 사이트맵에 영영 들어가지
 * 않는다. 1시간마다 다시 만든다 — 크롤러가 사이트맵을 읽는 주기를 생각하면
 * 이보다 촘촘할 이유가 없다.
 */
export const revalidate = 3600;

/** 게시판 목록은 로케일마다 라벨만 다르고 코드는 같아서 기본 로케일로 한 번만 받는다. */
async function loadCategorySlugs(): Promise<string[]> {
  const tree = await getCategoryTree(DEFAULT_LOCALE, serverApiClient);
  return tree.groups
    .flatMap((group) => group.categories)
    .filter((category) => category.visible)
    .map((category) => categoryCodeToSlug(category.code));
}

async function loadPostIds(): Promise<number[]> {
  const ids: number[] = [];

  for (let page = 0; page < POST_PAGES; page++) {
    const response = await getPosts(
      { sort: "NEW", period: "ALL", page },
      serverApiClient
    );
    ids.push(...response.content.map((post) => post.id));
    if (!response.hasNext) break;
  }

  return ids;
}

/**
 * 게시판과 게시글 URL 만 담는다. 커뮤니티 첫 화면(/community)은 다른 정적 경로와
 * 함께 루트 사이트맵이 갖는다.
 *
 * 백엔드가 죽어 있어도 사이트맵 자체는 200 으로 나가야 해서 실패를 삼킨다 —
 * 빈 사이트맵이 500 보다 낫다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  try {
    const [slugs, postIds] = await Promise.all([
      loadCategorySlugs(),
      loadPostIds(),
    ]);

    return [
      ...slugs.flatMap((slug) =>
        localizedSitemapEntries(`/community/board/${slug}`, lastModified)
      ),
      ...postIds.flatMap((id) =>
        localizedSitemapEntries(`/community/board/detail/${id}`, lastModified)
      ),
    ];
  } catch (error) {
    logger.error("Failed to build community sitemap", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
