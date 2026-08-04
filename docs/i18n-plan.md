# METAPICK 다국어(i18n) 도입 계획

> 상태: 계획 (미착수)
> 대상 언어: 한국어(`ko`), 영어(`en`) — 1차
> 작성 기준: Next.js 16.1.6 / next-intl 4.13.5 / FSD 구조

---

## 1. 목표와 범위

### 하는 것

- UI에 하드코딩된 한국어 문구를 번역 리소스로 분리하고 `ko` / `en` 전환 지원
- URL에 로케일을 반영해 언어별 페이지가 독립적으로 검색 색인되도록 함
- 날짜/상대시간/숫자 포맷의 로케일 대응

### 안 하는 것 (1차 범위 외)

- **게임 데이터(챔피언·아이템·룬·스펠)의 다국어화** — 현행 `public/data/*.json` 방식을 그대로 유지한다. 별도 이슈 [MP-106](https://linear.app/metapick/issue/MP-106)으로 분리 → [5.4](#54-게임-데이터--1차-범위-외-현행-유지)
- 사용자 생성 콘텐츠 번역 (커뮤니티 게시글·댓글, 듀오 등록글) — 원문 그대로 노출
- `ko`/`en` 외 언어 추가 — 다만 확장 가능한 구조로 설계
- 백엔드 응답 메시지의 다국어화 — [9. 결정 필요 사항](#9-결정-필요-사항) 참고

---

## 2. 확정된 결정사항

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| URL 전략 | 모든 언어 prefix (`/ko/...`, `/en/...`) | 구조 일관성, 기본 언어 변경 용이. 기존 URL은 301 리다이렉트로 흡수 |
| 라이브러리 | `next-intl` v4 | App Router·서버 컴포넌트·`generateMetadata` 지원, ICU 포맷 내장, Next 16 공식 대응 |
| UI 번역 파일 위치 | 레포 번들 (`src/shared/i18n/messages/{ko,en}.json`) | 빌드 타임 키 검증·타입 추론, SSR 시 네트워크 요청 0 |
| 게임 데이터 | **현행 유지** (`public/data/*.json`, 한국어 고정) | 다국어 게임 데이터 API를 추후 구축 ([MP-106](https://linear.app/metapick/issue/MP-106)). 1차 릴리스의 알려진 제약으로 감수 |
| OAuth 콜백 경로 | 로케일 밖 고정 (`/auth/callback`) | 언어를 추가해도 백엔드·OAuth 설정 변경이 필요 없음 |

---

## 3. 현황 (As-Is)

### 3.1 게임 데이터

`public/data/` 아래 정적 JSON을 클라이언트에서 직접 `fetch` → `useGameDataStore`(Zustand)에 적재.

| 파일 | 크기 | 내용 | 언어 |
| --- | --- | --- | --- |
| `championFull.json` | 4.8 MB | `version: "16.4.1"`, 챔피언명·스킬 설명 | 한국어 고정 |
| `item.json` | 1.0 MB | 아이템명·설명 | 한국어 고정 |
| `runesReforged.json` | 54 KB | 룬 (`"지배"` 등) | 한국어 고정 |
| `summoner.json` | 48 KB | 소환사 주문 (`"방어막"` 등) | 한국어 고정 |
| `queue.json` | 1 KB | 큐 타입 | **`description`(영문) + `descriptionKo` 병기** |
| `spectator.json` | 5 KB | 관전 목업 | 언어 무관 |
| `languages.json` | 225 B | Data Dragon 로케일 목록 28개 | 미사용 |

로딩 진입점: `src/app/GameDataLoader.tsx` → `loadChampionData/SummonerData/ItemData/RuneData` + `useSeasonStore.loadSeasons`

### 3.2 라우팅 / SEO

- `src/app/` 직속에 페이지 25개, `middleware.ts` 없음
- `<html lang="ko">` 하드코딩 (`src/app/layout.tsx`)
- `metadata` / `generateMetadata` 15곳 — 모두 한국어 고정
- `sitemap.ts`(4개 URL), `champion-stats/sitemap.ts`, `patch-notes/sitemap.ts`, `robots.ts`
- `app/` 내부 상대경로 import는 `layout.tsx → ./GameDataLoader` 1곳뿐 → 디렉토리 이동 부담 낮음
- `tests/` 디렉토리·E2E 스펙 파일 없음 (playwright.config.ts만 존재) → 경로 변경에 따른 테스트 수정 부담 없음

### 3.3 하드코딩된 한국어

전체 320개 TS/TSX 중 **168개 파일**에 한글 포함. 주석 271줄을 제외하면 **약 800개 문자열**이 번역 대상.

레이어별 분포:

| 레이어 | 파일 수 | 성격 |
| --- | --- | --- |
| `widgets` | 69 | 대부분 순수 UI 문구 (가장 큰 덩어리) |
| `features` | 31 | 폼 라벨·검증 메시지·모달 |
| `shared` | 22 | 공통 UI + 유틸 상수(`position.ts`, `date.ts`, `runes.ts`) |
| `entities` | 19 | 도메인 라벨 상수 + API 에러 메시지 |
| `app` | 17 | SEO metadata |
| `views` | 10 | 약관·개인정보처리방침 통문장 포함 |

작업량 상위 파일:

```
34  widgets/match-history/ui/MatchHistory.tsx
20  widgets/match-history/ui/ContributionGraph.tsx
20  views/privacy-policy/ui/PrivacyPolicyPageClient.tsx
15  shared/ui/tooltip/ChampionTooltipContent.tsx
11  widgets/summoner-profile/ui/ProfileSection.tsx
11  widgets/summoner-profile/ui/FanLetter.tsx
11  widgets/match-history/ui/MatchSummary.tsx
11  views/terms-of-service/ui/TermsOfServicePageClient.tsx
10  widgets/match-detail/ui/MatchDetailOverview.tsx
```

---

## 4. 목표 구조 (To-Be)

```
src/
├── proxy.ts                        # ★ 신규 — Next.js 16은 middleware.ts 대신 proxy.ts
├── app/
│   ├── layout.tsx                  # 로케일 무관 루트 (html/body는 [locale]/layout으로 이동)
│   ├── globals.css
│   ├── favicon.ico
│   ├── robots.ts
│   ├── sitemap.ts                  # 로케일별 URL + alternates 생성
│   ├── auth/callback/              # ★ 로케일 밖 고정 — 외부(백엔드)가 이 주소를 기억
│   └── [locale]/                   # ★ 나머지 페이지 24개 이동
│       ├── layout.tsx              # <html lang={locale}> + NextIntlClientProvider
│       ├── page.tsx
│       ├── summoners/[region]/[summonerName]/
│       ├── champion-stats/[championId]/
│       ├── community/...
│       ├── duo/, leaderboards/, patch-notes/, mypage/, login/
│       └── ...
├── shared/
│   ├── i18n/                       # ★ 신규
│   │   ├── routing.ts              # defineRouting({ locales, defaultLocale })
│   │   ├── request.ts              # getRequestConfig — 메시지 로딩
│   │   ├── navigation.ts           # Link, redirect, usePathname, useRouter 래퍼
│   │   ├── locale.ts               # Locale 타입 + Data Dragon 로케일 매핑
│   │   └── messages/
│   │       ├── ko.json             # 기준(source of truth)
│   │       └── en.json
│   └── model/game-data/            # 변경 없음 — 게임 데이터는 현행 유지
└── features/
    └── locale-switcher/            # ★ 신규 (theme-toggle과 동일 패턴)
        ├── model/
        └── ui/LocaleSwitcher.tsx
```

> **FSD 예외**: `src/proxy.ts`는 Next.js가 위치를 강제하므로 레이어 밖에 둔다. `app/` 예외(`patch-notes`)와 같은 성격의 문서화된 예외로 취급.

---

## 5. 상세 설계

### 5.1 로케일 정의와 매핑

```ts
// src/shared/i18n/locale.ts
export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

// URL 로케일 → Data Dragon 로케일
// 1차에서는 사용처가 없다. 게임 데이터 다국어 API를 붙일 때 쓸 매핑을 미리 자리만 잡아둔다.
export const DDRAGON_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};

// URL 로케일 → Intl 로케일 (날짜/숫자 포맷용)
export const INTL_LOCALE: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
};
```

`public/data/languages.json`의 28개 로케일 목록은 향후 언어 확장 시 이 매핑 테이블을 넓히는 근거로만 사용한다.

### 5.2 라우팅과 리다이렉트

**설정 파일 3종:**

```ts
// src/shared/i18n/routing.ts
import { defineRouting } from "next-intl/routing";
import { LOCALES, DEFAULT_LOCALE } from "./locale";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",     // /ko, /en 양쪽 다 prefix
  localeDetection: true,      // Accept-Language + NEXT_LOCALE 쿠키
});
```

```ts
// src/proxy.ts  ← Next.js 16: middleware.ts 아님
import createMiddleware from "next-intl/middleware";
import { routing } from "@/shared/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
```

```ts
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");
export default withNextIntl(nextConfig);
```

**301 리다이렉트 처리 (중요):**

next-intl의 프록시는 로케일 리다이렉트를 **307(임시)** 로 반환한다. 기존 URL의 검색 순위·링크 에쿼티를 `/ko/...`로 넘기려면 **301(영구)** 이 필요하다. 두 가지 방법 중 택1:

- **(권장) 프록시 래핑** — 응답 status를 301로 바꿔 반환. 모든 경로에 일괄 적용되고 규칙 목록을 유지보수할 필요가 없다.

  ```ts
  // src/proxy.ts
  const handleI18n = createMiddleware(routing);

  export default function proxy(request: NextRequest) {
    const response = handleI18n(request);

    // 로케일 리다이렉트를 301로 승격 (SEO)
    // next-intl은 NextResponse.redirect(url)을 status 인자 없이 호출 → 기본값 307
    if (response.status === 307) {
      const location = response.headers.get("location");
      if (location) {
        const promoted = NextResponse.redirect(location, 301);
        // ★ 새 응답을 만들면 next-intl이 심은 것들이 사라진다 — 반드시 이전
        response.cookies.getAll().forEach((c) => promoted.cookies.set(c));
        const link = response.headers.get("link");
        if (link) promoted.headers.set("link", link);
        return promoted;
      }
    }
    return response;
  }
  ```

  > **주의 2가지**
  > 1. 새 `NextResponse`를 만들면 next-intl이 리다이렉트 응답에 심는 `NEXT_LOCALE` 쿠키와 대체 링크(`Link`) 헤더가 유실된다. 위처럼 명시적으로 옮겨야 언어 선택이 유지된다.
  > 2. 301은 브라우저가 영구 캐시하므로 **경로 규칙이 확정된 후에만** 적용한다. 스테이징에서는 307로 두고 프로덕션 배포 시점에 켠다.

- **(대안) `next.config.ts`의 `redirects()`** — Next.js 라우팅 순서상 프록시보다 먼저 실행되므로 기존 경로를 명시적으로 301 매핑. 경로가 추가될 때마다 규칙을 갱신해야 한다.

**로케일별 정적 생성:**

```ts
// src/app/[locale]/layout.tsx
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

#### 로케일 밖 경로 — OAuth 콜백

**모든 경로에 로케일을 붙일 필요는 없다.** 외부 시스템이 URL을 기억하는 경로는 로케일 밖에 고정해야 언어를 추가할 때마다 외부 설정을 건드리지 않는다.

현재 OAuth 플로우를 먼저 짚으면:

```
프론트  window.location.href = `${SERVER_ROOT_URL}/oauth2/authorize/google`   ← features/auth/model/useGoogleLogin.ts:18
   ↓
백엔드  Google로 리다이렉트 (구글 콘솔에 등록된 redirect_uri는 **백엔드** 주소)
   ↓
백엔드  인증 완료 → 프론트 `/auth/callback` 으로 되돌려보냄 (`#error=`, `#linkSuccess=true` 해시 전달)
   ↓
프론트  CallbackPageClient → handleAuthCallback() → getMyProfile() → router.replace("/")
```

즉 **구글 OAuth 콘솔에 등록되는 redirect_uri는 백엔드 주소이지 프론트 주소가 아니다.** 언어를 아무리 늘려도 구글 쪽 설정은 변하지 않는다. 관리 부담이 생길 수 있는 지점은 "백엔드가 프론트로 되돌려보내는 URL" 하나뿐이며, 아래처럼 두면 그것도 고정된다.

**규약: `/auth/**` 는 `[locale]` 밖에 둔다.**

```
src/app/
├── auth/callback/page.tsx      ← [locale] 밖에 그대로 유지
└── [locale]/...
```

```ts
// src/proxy.ts — matcher에서 auth 제외
export const config = {
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
};
```

얻는 것:

- 백엔드가 아는 프론트 콜백 주소는 `https://metapick.me/auth/callback` **하나로 영구 고정** — 언어를 28개로 늘려도 백엔드·구글 콘솔 설정 변경 0
- 콜백 페이지는 스피너와 리다이렉트뿐이라 로케일 컨텍스트가 사실상 불필요

**로그인 후 원래 언어로 복귀시키는 방법** — next-intl이 이미 `NEXT_LOCALE` 쿠키를 관리하므로 그것을 읽어 목적지에 로케일을 붙인다.

```ts
// handleAuthCallback 내부
const locale = getLocaleFromCookie() ?? DEFAULT_LOCALE;  // NEXT_LOCALE
router.replace(`/${locale}`);
// 에러: router.replace(`/${locale}/login?error=...`)
// 연동 성공: router.replace(`/${locale}/mypage?linkSuccess=true`)
```

쿠키는 `SameSite=Lax`라도 OAuth 복귀(top-level GET 내비게이션)에서 정상 전송되므로 안전하다. 쿠키가 없으면 `DEFAULT_LOCALE`로 폴백한다.

> **대안 (백엔드 변경이 필요해 1차에서는 불채택)**
> - **OAuth `state`에 로케일·복귀경로 인코딩** — 표준적이고 견고하다. 백엔드가 `state`를 왕복시켜야 한다. "로그인 전에 보던 페이지로 복귀"라는 UX 개선까지 함께 하려면 이 방식이 맞다.
> - **`?returnTo=` 쿼리 전달** — 백엔드가 값을 그대로 되돌려줘야 하고, 오픈 리다이렉트 방지를 위해 화이트리스트 검증이 필요하다.
>
> 두 대안 모두 "로그인 후 원래 보던 페이지로 돌아가기"를 구현할 때 다시 검토할 가치가 있다. 로케일 유지만이 목적이라면 쿠키 방식으로 충분하다.

같은 규약이 적용되는 그 외 경로: `robots.txt`, `sitemap.xml`, `favicon.ico`, 향후 추가될 웹훅·결제 콜백.

### 5.3 번역 리소스 네임스페이스 설계

파일 하나에 800개 키를 평면으로 쌓으면 관리가 무너진다. **FSD 슬라이스 이름을 그대로 네임스페이스로** 쓴다.

```jsonc
// src/shared/i18n/messages/ko.json
{
  "common":        { "search": "검색", "loading": "불러오는 중", "retry": "다시 시도" },
  "nav":           { "home": "홈", "leaderboards": "랭킹", "community": "커뮤니티", "duo": "듀오 찾기" },
  "summonerProfile": { "level": "레벨 {level}", "lastUpdated": "최근 갱신 {time}" },
  "matchHistory":  { "win": "승리", "lose": "패배", "kda": "KDA", "avgKda": "평균 {value}" },
  "matchDetail":   { ... },
  "championStats": { ... },
  "ranking":       { ... },
  "community":     { ... },
  "duo":           { ... },
  "mypage":        { ... },
  "patchNotes":    { ... },
  "auth":          { ... },
  "domain": {                              // 도메인 라벨 상수 (5.6)
    "position":  { "TOP": "탑", "JUNGLE": "정글", "MID": "미드", "ADC": "원딜", "SUPPORT": "서포터" },
    "queue":     { "420": "솔로 랭크", "440": "자유 랭크", "450": "무작위 총력전" },
    "tier":      { ... },
    "leagueType":{ "RANKED_SOLO_5x5": "솔로 랭크", "RANKED_FLEX_SR": "자유 랭크" }
  },
  "metadata":      { "home": { "title": "...", "description": "..." }, ... },  // SEO (5.7)
  "errors":        { "network": "...", "notFound": "...", "unknown": "..." }
}
```

규칙:

- **`ko.json`이 기준**이고 `en.json`은 동일한 키 집합을 가진다
- 키는 의미 기반(`matchHistory.win`)으로, 문구 기반(`matchHistory.승리`) 금지
- 변수는 ICU 문법(`{level}`), 복수형은 `{count, plural, ...}` 사용
- 네임스페이스 1단계는 FSD 슬라이스명, 그 외는 `common` / `domain` / `metadata` / `errors`

### 5.4 게임 데이터 — 1차 범위 외 (현행 유지)

게임 데이터의 다국어화는 **다국어 게임 데이터 API가 준비된 뒤**로 미룬다 — [MP-106](https://linear.app/metapick/issue/MP-106). 1차에서는 `public/data/*.json`을 지금 그대로 쓰고, `useGameDataStore`도 손대지 않는다.

#### 1차 릴리스의 알려진 제약

`/en`으로 접속해도 아래 항목은 **한국어로 표시된다.** 릴리스 전에 합의된 제약임을 명확히 해둔다.

| 항목 | 출처 | 영향 화면 |
| --- | --- | --- |
| 챔피언 이름 | `championFull.json` | 전적 검색, 매치 상세, 챔피언 분석, 랭킹, 인게임 — 사실상 전 화면 |
| 챔피언 스킬 설명 | `championFull.json` | 챔피언 툴팁, 스킬트리 |
| 아이템 이름·설명 | `item.json` | 아이템 빌드, 매치 상세 툴팁 |
| 룬 이름·설명 | `runesReforged.json` | 룬 통계, 매치 상세 |
| 소환사 주문 | `summoner.json` | 매치 목록·상세 |

즉 **영어 UI 프레임에 한국어 게임 용어가 섞인 화면**이 된다. 전적 검색 서비스 특성상 화면의 상당 비중이 챔피언·아이템 이름이므로, 이 상태를 "영어 지원"으로 홍보하기는 어렵다. 게임 데이터 API 완료 전까지는 `/en`을 **베타로 표기하거나 sitemap 등재를 보류하는 것**을 권장한다.

#### 부분적으로 지금도 가능한 것

- **큐 타입** — `queue.json`이 `description`(영문)과 `descriptionKo`를 **둘 다** 갖고 있다. 로케일에 따라 필드를 골라 쓰면 게임 데이터 API 없이도 지금 대응 가능하다. Phase 4에서 처리한다.
- **포지션·티어·리그 타입** — Data Dragon이 아니라 프론트 상수이므로 [5.6](#56-도메인-라벨-상수-정리)에서 정상 번역된다.
- **이미지** — 챔피언·아이템·룬 이미지는 언어와 무관하므로 영향 없다.

#### 전환 시점의 설계 스케치 ([MP-106](https://linear.app/metapick/issue/MP-106)에서 진행)

지금 결정할 필요는 없지만, 나중에 되짚기 쉽도록 방향만 남긴다. 아래 내용은 MP-106 본문에도 옮겨두었다.

- 로케일별 경로로 내려받기 — `{host}/data/{version}/{ko_KR|en_US}/{file}.json`. `Locale` → Data Dragon 로케일 매핑은 [5.1](#51-로케일-정의와-매핑)의 `DDRAGON_LOCALE`을 그대로 쓴다.
- `useGameDataStore`에 `locale`/`version` 필드를 추가하고, 값이 바뀌면 기존 데이터를 버리고 재로딩 — 현재의 "데이터가 있으면 skip" 로직을 `locale/version` 비교로 교체해야 한다. **지금 구조로는 언어를 바꿔도 재로딩되지 않는다는 점이 전환 시 핵심 작업.**
- 버전을 어떻게 알아낼지(환경변수 / manifest / API)는 그 이슈에서 결정한다.
- `championFull.json`이 4.8MB라 언어별로 2벌이 되므로 브로틀리 압축과 경량 인덱스 분리를 함께 검토한다.

### 5.5 서버/클라이언트 컴포넌트에서의 사용

```tsx
// 서버 컴포넌트 / generateMetadata
import { getTranslations } from "next-intl/server";
const t = await getTranslations({ locale, namespace: "metadata.home" });

// 클라이언트 컴포넌트
"use client";
import { useTranslations } from "next-intl";
const t = useTranslations("matchHistory");
t("avgKda", { value: 3.42 })
```

`app/[locale]/layout.tsx`에서 `NextIntlClientProvider`로 감싸되, **메시지 전체를 클라이언트로 내리지 않도록** 필요한 네임스페이스만 선별해 전달하는 것을 기본으로 한다(번들 크기 방어).

### 5.6 도메인 라벨 상수 정리

한국어가 값으로 박힌 상수 맵들은 **키만 남기고** 표시 문구는 메시지로 옮긴다.

| 파일 | 현재 | 변경 |
| --- | --- | --- |
| `shared/lib/position.ts` | `getPositionName()` 이 "탑/정글/미드" 반환 | 키(`TOP`…)만 반환, UI에서 `t('domain.position.TOP')` |
| `entities/community/types.ts` | `CATEGORY_LABELS`, `SORT_LABELS`, `PERIOD_LABELS` 한국어 값 | 라벨 제거, 키 배열만 export |
| `entities/league/ui/LeagueInfo.tsx` | `"솔로 랭크" / "자유 랭크"` 삼항식 | `t('domain.leagueType.<key>')` |
| `features/champion-stats-filter/lib/tiers.ts` | 티어 한국어 | `domain.tier.*` |
| `shared/constants/runes.ts` | 룬 설명 한국어 | `runesReforged.json`과 중복인지 먼저 확인. 프론트 상수라면 번역, 게임 데이터 중복이면 제거 (게임 데이터는 어차피 한국어 고정) |
| `public/data/queue.json` | `description`(영문) + `descriptionKo` 병기 | **파일 변경 없이** 로케일에 따라 읽을 필드만 분기 — 게임 데이터 중 유일하게 지금 영어 대응 가능 |

### 5.7 날짜·숫자 포맷

- `shared/lib/date.ts`의 `getRelativeTime()`(방금 전/분 전/시간 전…)은 **next-intl `useFormatter().relativeTime()`** 으로 교체 — 언어별 표현·복수형을 라이브러리가 처리
- `formatDate()`의 `toLocaleDateString("ko-KR", …)` 하드코딩 → `format.dateTime()` 또는 `INTL_LOCALE[locale]` 주입
- 승률·KDA 등 숫자는 `format.number()` 사용 (영어권 천 단위 구분자)
- `dayjs`는 `ProfileSection.tsx` 1곳에서 KST 오프셋 계산용으로만 쓰이므로 그대로 유지

### 5.8 언어 스위처

```
src/features/locale-switcher/
├── ui/LocaleSwitcher.tsx
└── index.ts
```

- `shared/i18n/navigation.ts`의 `usePathname()` / `useRouter()` 래퍼로 **현재 경로를 유지한 채 로케일만 교체**
- 선택 결과는 `NEXT_LOCALE` 쿠키에 저장 (next-intl이 자동 처리)
- 배치: `widgets/layout/ui/Header.tsx` — 기존 테마 토글 옆
- 모바일에서는 `Navigation.tsx` 내부 메뉴에 포함

### 5.9 SEO

- `<html lang={locale}>` 동적 바인딩
- 모든 `metadata` / `generateMetadata` 15곳을 `getTranslations` 기반으로 전환
- **hreflang** — next-intl 프록시가 HTTP `Link` 헤더로 대체 링크를 자동 생성한다(`alternateLinks` 기본 `true`). 여기에 더해 HTML `<link>` 태그도 명시하는 것을 권장 — 헤더는 크롤러가 리다이렉트 응답에서 놓칠 수 있고, 정적 생성 페이지에서는 태그 쪽이 확실하다.

  ```ts
  alternates: {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      ko: `${BASE_URL}/ko${path}`,
      en: `${BASE_URL}/en${path}`,
      "x-default": `${BASE_URL}/ko${path}`,
    },
  }
  ```

- `sitemap.ts` / `champion-stats/sitemap.ts` / `patch-notes/sitemap.ts` → 로케일별 URL 2배 생성 + `alternates.languages` 포함
- `robots.ts`는 변경 불필요

### 5.10 타입 안전과 검증

```ts
// src/global.d.ts
import type messages from "@/shared/i18n/messages/ko.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
    Locale: import("@/shared/i18n/locale").Locale;
  }
}
```

→ `t("존재하지않는키")` 가 **컴파일 에러**가 된다.

추가 방어선:

- **키 동기화 검사 스크립트** — `ko.json` 대비 `en.json`의 누락/잉여 키를 검출, CI(`pnpm lint` 단계)에 연결
- **하드코딩 한글 검출 ESLint 룰** — `no-restricted-syntax` 로 JSX 텍스트/문자열 리터럴 내 `[가-힣]` 경고. 마이그레이션 완료 슬라이스부터 점진 적용 (주석은 예외)

---

## 6. 단계별 실행 계획

각 Phase는 독립 PR로 나눈다. Phase 1이 가장 위험도가 높으므로 단독 PR로 분리한다.

### Phase 0 — 선행 결정 (코드 변경 없음)

- [9. 결정 필요 사항](#9-결정-필요-사항)의 항목들을 백엔드와 합의
- **백엔드가 프론트로 되돌려보내는 콜백 주소가 `{FRONT}/auth/callback`로 유지되는지 확인** — [5.2 로케일 밖 경로](#로케일-밖-경로--oauth-콜백) 규약대로면 변경이 없어야 한다. 백엔드에 프론트 경로가 하드코딩돼 있는지만 점검
- `/en` 노출 정책 결정 — 게임 데이터가 한국어로 남으므로([5.4](#54-게임-데이터--1차-범위-외-현행-유지)) 베타 표기 또는 sitemap 등재 보류 여부

**완료 기준**: 결정 사항이 이슈에 기록되고 백엔드 확인 완료

### Phase 1 — 라우팅 인프라 (문구는 아직 한국어 그대로)

1. `pnpm add next-intl` (v4.13+)
2. `shared/i18n/{locale,routing,request,navigation}.ts` 생성
3. `next.config.ts`에 `createNextIntlPlugin` 적용
4. `src/proxy.ts` 생성 — matcher에서 `auth` 제외
5. `src/app/*` → `src/app/[locale]/*` 이동
   - **제외(로케일 밖 유지)**: `globals.css`, `favicon.ico`, `robots.ts`, `sitemap.ts`, **`auth/callback/`**
6. `[locale]/layout.tsx`에서 `<html lang={locale}>` + `NextIntlClientProvider` + `generateStaticParams`
7. `handleAuthCallback`의 리다이렉트 목적지에 쿠키 기반 로케일 반영 ([5.2](#로케일-밖-경로--oauth-콜백))
8. 301 리다이렉트 (스테이징은 307 유지)

**완료 기준**: `/ko`·`/en` 전 페이지 정상 렌더 + `pnpm build` 통과 + `/summoners/...` → `/ko/summoners/...` 리다이렉트 확인 + **구글 로그인 왕복 성공 및 로그인 후 원래 언어 유지**

### Phase 2 — 공통 레이어 번역

- `shared/ui/*` (Modal, Toast, Tooltip, LaneSelector, VoteButtons)
- `widgets/layout/*` (Header, Navigation, Footer)
- `features/locale-switcher` 신규 + Header 배치
- `errors` 네임스페이스 + 공통 에러/빈 상태 문구
- `global.d.ts` 타입 선언

**완료 기준**: 레이아웃·공통 컴포넌트에 한글 리터럴 0

### Phase 3 — 도메인 상수 + 포맷

- [5.6](#56-도메인-라벨-상수-정리) 표의 상수 맵 정리
- [5.7](#57-날짜숫자-포맷) 날짜/숫자 포맷 전환
- **큐 타입 로케일 분기** — `queue.json`의 `description`(영문) / `descriptionKo`를 로케일에 따라 선택 ([5.4](#54-게임-데이터--1차-범위-외-현행-유지))

**완료 기준**: `shared/lib/position.ts`, `date.ts`, `entities/*/types.ts`에 한글 리터럴 0

### Phase 4 — 페이지별 번역 (분량 최대, 여러 PR로 분할)

트래픽 순 우선순위:

1. 홈 (`views/home`, `widgets/home-sections`)
2. **전적 검색** — `widgets/summoner-profile`, `match-history`, `match-detail`, `recently-played`, `ingame` *(가장 큰 덩어리)*
3. 챔피언 분석 — `widgets/champion-stats-panel`, `features/champion-stats-filter`
4. 랭킹 — `widgets/ranking`, `features/ranking-filter`
5. 듀오 — `widgets/duo-list`, `features/duo-*`
6. 커뮤니티 — `widgets/community-*`, `features/community-*`
7. 마이페이지·로그인 — `widgets/mypage-panel`, `features/auth`, `nickname-edit`, `member-withdrawal`, `riot-link`
8. 패치노트 — `widgets/patch-content`, `entities/patch-note`
9. 약관·개인정보처리방침 — 통문장이므로 컴포넌트에서 분리해 별도 처리 (아래 참고)

> **약관/개인정보처리방침**: 문단 단위 통문장 100여 줄이라 메시지 JSON에 넣기에 부적합하다. `views/terms-of-service/content/{ko,en}.tsx` 처럼 로케일별 컴포넌트를 두고 분기하는 방식을 권장. **영문 법무 검토가 필요하므로 일정상 마지막에 배치.**

**완료 기준**: 슬라이스별로 한글 리터럴 0 + 해당 슬라이스에 ESLint 한글 검출 룰 활성화

### Phase 5 — SEO 마무리

- `metadata` / `generateMetadata` 15곳 전환
- hreflang `alternates` 추가
- sitemap 3종 로케일 대응 — Phase 0에서 `/en` 등재 보류를 택했다면 `ko`만 등재
- 프로덕션 301 리다이렉트 활성화
- Search Console에 사이트맵 재제출

**완료 기준**: `/ko`·`/en` 페이지 소스에 올바른 `lang`·`hreflang`·`canonical`

### Phase 6 — 검증

- 키 동기화 스크립트 CI 연결
- 하드코딩 한글 검출 룰 전역 적용
- Playwright E2E 최소 시나리오 추가 (`/ko`↔`/en` 전환, 리다이렉트, OAuth 콜백 후 로케일 유지)
- 영어 UI 레이아웃 점검 — **한국어 대비 영문이 1.3~1.8배 길어** 버튼·탭·테이블 헤더가 깨지는 곳 확인

---

## 7. 리스크와 대응

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| **게임 데이터 한국어 고정** | `/en`에서 챔피언·아이템·룬 이름이 한국어로 노출 — 영어 사용자 체감 품질 저하 | 다국어 게임 데이터 API 완료까지 `/en`을 베타 표기하거나 sitemap 등재 보류 ([5.4](#54-게임-데이터--1차-범위-외-현행-유지)) |
| 기존 URL 전부 변경 | 검색 순위 일시 하락, 외부 백링크 깨짐 | 301 영구 리다이렉트, sitemap 재제출, 전환 후 2~4주 Search Console 모니터링 |
| 301 캐시의 비가역성 | 잘못된 규칙이 브라우저에 영구 캐시 | 스테이징에서는 307 유지, 경로 확정 후 프로덕션에서만 301 활성화 |
| OAuth 콜백 경로 | 로그인 실패 | 콜백을 로케일 밖에 고정해 애초에 경로가 바뀌지 않게 한다. 구글 콘솔의 redirect_uri는 백엔드 주소라 원래 영향 없음 ([5.2](#로케일-밖-경로--oauth-콜백)) |
| 영문 텍스트 길이 | 레이아웃 깨짐 | Phase 6 전용 점검, 고정폭 요소에 `truncate`/`min-w` 재검토 |
| `use cache` 비호환 | 향후 캐시 최적화 제약 | next-intl은 `getTranslations()`가 요청 헤더에 의존해 `use cache`와 함께 쓰기 어렵다. 현재 미사용이므로 문제없으나 도입 시 `next/root-params` 기반 우회 필요 |
| 800개 문자열 일괄 변경 | 리뷰 불가능한 대형 PR, 회귀 위험 | Phase 4를 슬라이스 단위 PR로 분할, 슬라이스별 ESLint 룰로 재유입 차단 |
| 번역 품질 | 게임 용어 오역 | LoL 공식 영문 용어 기준 (예: 정글=Jungle, 원딜=Bot/ADC, 자유 랭크=Flex) 용어집을 `docs/i18n-glossary.md`로 관리 |

---

## 8. 예상 작업량

| Phase | 내용 | 규모 |
| --- | --- | --- |
| 0 | 선행 결정 | 협의 |
| 1 | 라우팅 인프라 | 파일 24개 이동 + 신규 6개 |
| 2 | 공통 레이어 | 파일 ~25개 |
| 3 | 도메인 상수/포맷 | 파일 ~10개 |
| 4 | 페이지별 번역 | **파일 ~110개, 문자열 ~700개** (전체의 80%) |
| 5 | SEO | 파일 ~18개 |
| 6 | 검증 | 스크립트 + 룰 + E2E |

> 게임 데이터 다국어화는 이 표에 포함되지 않는다 — [MP-106](https://linear.app/metapick/issue/MP-106).

---

## 9. 결정 필요 사항

Phase 1 착수 전에 확정해야 하는 항목:

1. **`/en` 노출 정책** — 게임 데이터가 한국어로 남는 상태에서 영어 페이지를 검색에 노출할지. 베타 표기 / sitemap 등재 보류 / 그대로 공개 중 택1.
2. **백엔드가 프론트로 되돌려보내는 콜백 주소** — `{FRONT}/auth/callback` 고정이 맞는지, 백엔드 설정에 프론트 경로가 하드코딩돼 있는지.
3. **백엔드 응답 문자열의 다국어화 여부** — 현재 `entities/*/api/`에서 `response.data.errorMessage`(서버 생성 한국어)를 그대로 노출한다. 세 가지 선택지:
   - (a) 백엔드가 `Accept-Language` 헤더를 받아 다국어 응답 → API 클라이언트 인터셉터에 헤더 추가
   - (b) 백엔드가 에러 **코드**를 반환하고 프론트가 번역 → 가장 견고, 백엔드 변경 필요
   - (c) 1차에서는 그대로 두고 프론트 fallback 메시지만 번역 → 가장 빠름
4. **커뮤니티 카테고리 등 서버 소유 열거값** — 라벨을 프론트에서 번역할지, 백엔드가 로케일별로 내려줄지.
5. **`/en` 기본 지역(region) 정책** — 영어 사용자의 기본 검색 지역을 KR로 둘지 NA로 둘지. `features/region-select` 기본값에 영향.
6. **약관·개인정보처리방침 영문본** — 법무 검토 주체와 일정.

> 게임 데이터 버전 체계와 경로 규약은 **[MP-106](https://linear.app/metapick/issue/MP-106)에서** 결정한다. 이 계획의 선행 조건이 아니다.

---

## 10. 참고

- [next-intl — App Router with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)
- [Next.js 16 업그레이드 가이드 (`middleware.ts` → `proxy.ts`)](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [next-intl 릴리스 노트](https://github.com/amannn/next-intl/releases)
