import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  // 워크스페이스 루트를 이 디렉토리로 고정한다.
  // 고정하지 않으면 Next 가 상위 디렉토리에서 lockfile 을 찾아 루트로 추론하는데,
  // git worktree 를 리포 안(.claude/worktrees/*)에 두고 작업하면 상위 체크아웃의
  // proxy.ts·app 라우트까지 끌어와 엉뚱한 모듈 해석 오류가 난다.
  turbopack: { root: import.meta.dirname },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.metapick.me",
        pathname: "/**",
      }
    ],
  },
};

export default withNextIntl(nextConfig);
