import { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";
import { localizedSitemapEntries } from "@/shared/i18n/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const championFile = await fs.readFile(
    path.join(process.cwd(), "public/data/championFull.json"),
    "utf-8"
  );
  const championData = JSON.parse(championFile);
  const lastModified = new Date();

  return Object.keys(championData.data).flatMap((championId) =>
    localizedSitemapEntries(`/champion-stats/${championId}`, lastModified)
  );
}
