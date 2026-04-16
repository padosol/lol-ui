import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.mmrtr.shop",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
