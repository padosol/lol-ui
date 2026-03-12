import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: [
      "https://metapick.me/sitemap.xml",
      "https://metapick.me/champion-stats/sitemap.xml",
      "https://metapick.me/patch-notes/sitemap.xml",
    ],
  };
}
