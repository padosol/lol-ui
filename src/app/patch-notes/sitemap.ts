import { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";
import { localizedSitemapEntries } from "@/shared/i18n/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const versionsFile = await fs.readFile(
    path.join(process.cwd(), "public/data/patch/versions.json"),
    "utf-8"
  );
  const versions: { version: string }[] = JSON.parse(versionsFile);
  const lastModified = new Date();

  return versions.flatMap((v) =>
    localizedSitemapEntries(`/patch-notes/${v.version}`, lastModified)
  );
}
