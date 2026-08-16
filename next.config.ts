import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

// `src/shared/config/game-data.ts` 와 같은 값을 본다.
// next.config 은 tsconfig 의 `@/` alias 를 타지 않아 그 모듈을 import 할 수 없어 옮겨 적는다.
const GAME_DATA_HOST =
  process.env.NEXT_PUBLIC_GAME_DATA_HOST || "https://static.metapick.me";
const GAME_DATA_PROXY_PREFIX = "/game-data";
const useGameDataProxy = process.env.NEXT_PUBLIC_GAME_DATA_PROXY === "true";

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

  /**
   * 게임 정적 데이터 CDN 프록시.
   * CDN(CloudFront)이 CORS 응답 헤더를 붙이지 않는 환경에서 브라우저가 JSON 을 직접
   * fetch 하면 막히므로, Next 서버가 대신 받아 같은 출처로 돌려준다.
   * 운영은 CloudFront 응답 헤더 정책이 CORS 를 붙이니 이 리라이트를 켜지 않는다.
   */
  async rewrites() {
    if (!useGameDataProxy) {
      return [];
    }

    return [
      {
        source: `${GAME_DATA_PROXY_PREFIX}/:path*`,
        destination: `${GAME_DATA_HOST}/data/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
