import { MetadataRoute } from "next";

const BASE_URL = "https://metapick.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/champion-stats`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/leaderboards`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/patch-notes`,
      lastModified: new Date(),
    },
  ];
}
