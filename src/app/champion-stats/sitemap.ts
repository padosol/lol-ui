import { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";

const BASE_URL = "https://metapick.me";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const championFile = await fs.readFile(
    path.join(process.cwd(), "public/data/championFull.json"),
    "utf-8"
  );
  const championData = JSON.parse(championFile);

  return Object.keys(championData.data).map((championId) => ({
    url: `${BASE_URL}/champion-stats/${championId}`,
    lastModified: new Date(),
  }));
}
