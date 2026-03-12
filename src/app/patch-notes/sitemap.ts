import { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";

const BASE_URL = "https://metapick.me";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const versionsFile = await fs.readFile(
    path.join(process.cwd(), "public/data/patch/versions.json"),
    "utf-8"
  );
  const versions: { version: string }[] = JSON.parse(versionsFile);

  return versions.map((v) => ({
    url: `${BASE_URL}/patch-notes/${v.version}`,
    lastModified: new Date(),
  }));
}
