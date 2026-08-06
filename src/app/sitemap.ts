import { MetadataRoute } from "next";
import { localizedSitemapEntries } from "@/shared/i18n/sitemap";

const PATHS = ["", "/champion-stats", "/leaderboards", "/patch-notes"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PATHS.flatMap((path) => localizedSitemapEntries(path, lastModified));
}
