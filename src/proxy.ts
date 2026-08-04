import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/shared/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/**
 * Next.js 16부터 middleware.ts 대신 proxy.ts 를 사용한다.
 *
 * matcher 에서 제외하는 경로:
 * - api        : API 라우트
 * - auth       : OAuth 콜백. 백엔드가 이 주소를 기억하므로 로케일 prefix를 붙이지 않는다.
 *                (언어가 늘어나도 백엔드 설정 변경이 필요 없도록)
 * - _next      : Next.js 내부 자원
 * - *.*        : 정적 파일 (favicon.ico, robots.txt, sitemap.xml, /data/*.json 등)
 */
export const config = {
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
};

/** 로케일 리다이렉트를 301(영구)로 승격할지 여부. 경로 규칙이 확정된 프로덕션에서만 켠다. */
const USE_PERMANENT_REDIRECT =
  process.env.NEXT_PUBLIC_I18N_PERMANENT_REDIRECT === "true";

export default function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  // next-intl 은 NextResponse.redirect(url) 을 status 인자 없이 호출하므로 기본값 307 이 나간다.
  // SEO 상 링크 에쿼티를 넘기려면 301 이어야 한다.
  if (USE_PERMANENT_REDIRECT && response.status === 307) {
    const location = response.headers.get("location");

    if (location) {
      const permanent = NextResponse.redirect(location, 301);

      // 새 응답을 만들면 next-intl 이 심은 것들이 사라진다 — 명시적으로 옮긴다.
      response.cookies.getAll().forEach((cookie) => {
        permanent.cookies.set(cookie);
      });

      const linkHeader = response.headers.get("link");
      if (linkHeader) {
        permanent.headers.set("link", linkHeader);
      }

      return permanent;
    }
  }

  return response;
}
