import { MetadataRoute } from "next";
import { localizedSitemapEntries } from "@/shared/i18n/sitemap";

// 게시판·게시글 URL 은 community/sitemap.ts 가 따로 담는다.
const PATHS = ["", "/champion-stats", "/leaderboards", "/patch-notes", "/community"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PATHS.flatMap((path) => localizedSitemapEntries(path, lastModified));
}
