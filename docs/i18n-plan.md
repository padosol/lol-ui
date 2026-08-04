# METAPICK 다국어(i18n) 도입 계획

> 상태: 계획 (미착수)
> 대상 언어: 한국어(`ko`), 영어(`en`) — 1차
> 작성 기준: Next.js 16.1.6 / next-intl 4.13.5 / FSD 구조

---

## 1. 목표와 범위

### 하는 것

- UI에 하드코딩된 한국어 문구를 번역 리소스로 분리하고 `ko` / `en` 전환 지원
- URL에 로케일을 반영해 언어별 페이지가 독립적으로 검색 색인되도록 함
- 게임 데이터(챔피언·아이템·룬·스펠)를 **S3에서 버전·언어별로** 내려받도록 전환
- 날짜/상대시간/숫자 포맷의 로케일 대응

### 안 하는 것 (1차 범위 외)

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
| 게임 데이터 위치 | S3 (버전·언어별 경로) | 사용자 지정 |

---

## 3. 현황 (As-Is)

### 3.1 게임 데이터

`public/data/` 아래 정적 JSON을 클라이언트에서 직접 `fetch` → `useGameDataStore`(Zustand)에 적재.

| 파일 | 크기 | 내용 |
| --- | --- | --- |
| `championFull.json` | 4.8 MB | `version: "16.4.1"`, 챔피언명·스킬 설명 (한국어 고정) |
| `item.json` | 1.0 MB | 아이템명·설명 (한국어 고정) |
| `runesReforged.json` | 54 KB | 룬 |
| `summoner.json` | 48 KB | 소환사 주문 |
| `spectator.json` | 5 KB | 관전 |
| `queue.json` | 1 KB | 큐 타입 (`description` + `descriptionKo` 병기) |
| `languages.json` | 225 B | Data Dragon 로케일 목록 28개 (미사용) |

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
│   └── [locale]/                   # ★ 기존 페이지 25개 전부 이동
│       ├── layout.tsx              # <html lang={locale}> + NextIntlClientProvider
│       ├── page.tsx
│       ├── summoners/[region]/[summonerName]/
│       ├── champion-stats/[championId]/
│       ├── community/...
│       ├── duo/, leaderboards/, patch-notes/, mypage/, login/, auth/callback/
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
│   └── model/game-data/            # 로케일 인지하도록 개편
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

// URL 로케일 → Data Dragon 로케일 (S3 경로용)
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

### 5.4 게임 데이터 S3 전환

**현재**

```ts
fetch("/data/championFull.json")
```

**변경 후**

```ts
// src/shared/config/data.ts
export const DATA_HOST = process.env.NEXT_PUBLIC_DATA_HOST ?? "https://static.metapick.me";

export function gameDataUrl(file: string, version: string, locale: Locale) {
  return `${DATA_HOST}/data/${version}/${DDRAGON_LOCALE[locale]}/${file}`;
}
// → https://static.metapick.me/data/16.4.1/ko_KR/championFull.json
```

**스토어 개편** — `useGameDataStore`에 현재 로케일/버전을 물려 캐시를 분리한다.

```ts
interface GameDataState {
  locale: Locale | null;
  version: string | null;
  championData: ChampionJson | null;
  // ...
  load: (opts: { locale: Locale; version: string }) => Promise<void>;
}
```

- `locale` 또는 `version`이 바뀌면 기존 데이터를 버리고 재로딩 (현재의 "이미 있으면 skip" 로직을 `locale/version` 비교로 교체)
- 진행 중 `loadPromise` 중복 방지 로직은 그대로 유지
- `GameDataLoader`는 `useLocale()`로 현재 로케일을 받아 넘긴다

**버전 확보 방법** — 3가지 중 결정 필요 ([9. 결정 필요 사항](#9-결정-필요-사항)):

1. 빌드 타임 환경변수 `NEXT_PUBLIC_GAME_DATA_VERSION` — 가장 단순, 데이터 갱신 시 재배포
2. S3의 `latest.json` manifest를 먼저 fetch — 배포 없이 갱신, 요청 1회 추가
3. 기존 `/v1/seasons` API의 `patchVersions` 활용 — 이미 호출 중이지만 "게임 데이터 버전"과 "패치 버전"이 같은 축인지 확인 필요

**캐싱** — 경로에 버전이 들어가므로 S3/CloudFront에 `Cache-Control: public, max-age=31536000, immutable` 설정 가능. 4.8MB `championFull.json`이 언어별로 2벌이 되므로 **브로틀리 압축 필수**.

**용량 최적화 (선택)** — `championFull.json`은 스킬 설명·스탯 전체를 포함한다. 실제로 툴팁 이외에는 이름/이미지 키만 쓰는 화면이 많으므로, 경량 인덱스(`championIndex.json`: id/key/name/image만)를 별도로 만들어 초기 로딩에 쓰고 상세는 지연 로딩하는 개선을 검토할 수 있다. **1차 범위 밖 — 별도 이슈로 분리.**

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
| `shared/constants/runes.ts` | 룬 설명 한국어 | 게임 데이터(S3 룬 JSON)로 대체 가능한지 먼저 확인 |
| `public/data/queue.json` | `description` + `descriptionKo` 병기 | S3 게임 데이터로 이관하고 로케일별 파일로 분리 |

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

- [9. 결정 필요 사항](#9-결정-필요-사항)의 항목들을 백엔드/인프라와 합의
- S3 경로 규약 확정, 언어별 게임 데이터 업로드 완료 확인
- OAuth `redirect_uri` 화이트리스트에 `/ko/auth/callback`, `/en/auth/callback` 추가 요청

**완료 기준**: S3 경로로 `curl` 했을 때 `ko_KR` / `en_US` 양쪽 JSON이 응답

### Phase 1 — 라우팅 인프라 (문구는 아직 한국어 그대로)

1. `pnpm add next-intl` (v4.13+)
2. `shared/i18n/{locale,routing,request,navigation}.ts` 생성
3. `next.config.ts`에 `createNextIntlPlugin` 적용
4. `src/proxy.ts` 생성
5. `src/app/*` → `src/app/[locale]/*` 이동 (`globals.css`, `favicon.ico`, `robots.ts`, `sitemap.ts`는 제외)
6. `[locale]/layout.tsx`에서 `<html lang={locale}>` + `NextIntlClientProvider` + `generateStaticParams`
7. 301 리다이렉트 (스테이징은 307 유지)

**완료 기준**: `/ko`, `/en` 양쪽 전 페이지 정상 렌더 + `pnpm build` 통과 + `/summoners/...` → `/ko/summoners/...` 리다이렉트 확인

### Phase 2 — 게임 데이터 S3 + 로케일 연동

1. `shared/config/data.ts` 추가, `NEXT_PUBLIC_DATA_HOST` 환경변수 (+ `.env.example` 갱신)
2. `useGameDataStore` 를 `locale`/`version` 인지 구조로 개편
3. `GameDataLoader` 가 현재 로케일 전달, 로케일 변경 시 재로딩
4. `queue.json`, `spectator.json` 도 동일 규약으로 이관
5. `public/data/*.json` 제거 (롤백 대비 1개 릴리스는 유지 후 삭제)

**완료 기준**: `/en`에서 챔피언·아이템 이름이 영어로 표시, 언어 전환 시 재로딩 확인

### Phase 3 — 공통 레이어 번역

- `shared/ui/*` (Modal, Toast, Tooltip, LaneSelector, VoteButtons)
- `widgets/layout/*` (Header, Navigation, Footer)
- `features/locale-switcher` 신규 + Header 배치
- `errors` 네임스페이스 + 공통 에러/빈 상태 문구
- `global.d.ts` 타입 선언

**완료 기준**: 레이아웃·공통 컴포넌트에 한글 리터럴 0

### Phase 4 — 도메인 상수 + 포맷

- [5.6](#56-도메인-라벨-상수-정리) 표의 상수 맵 정리
- [5.7](#57-날짜숫자-포맷) 날짜/숫자 포맷 전환

**완료 기준**: `shared/lib/position.ts`, `date.ts`, `entities/*/types.ts`에 한글 리터럴 0

### Phase 5 — 페이지별 번역 (분량 최대, 여러 PR로 분할)

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

### Phase 6 — SEO 마무리

- `metadata` / `generateMetadata` 15곳 전환
- hreflang `alternates` 추가
- sitemap 3종 로케일 대응
- 프로덕션 301 리다이렉트 활성화
- Search Console에 `/en` 사이트맵 제출

**완료 기준**: `/ko`·`/en` 페이지 소스에 올바른 `lang`·`hreflang`·`canonical`

### Phase 7 — 검증

- 키 동기화 스크립트 CI 연결
- 하드코딩 한글 검출 룰 전역 적용
- Playwright E2E 최소 시나리오 추가 (`/ko`↔`/en` 전환, 리다이렉트, 게임 데이터 로케일)
- 영어 UI 레이아웃 점검 — **한국어 대비 영문이 1.3~1.8배 길어** 버튼·탭·테이블 헤더가 깨지는 곳 확인

---

## 7. 리스크와 대응

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| 기존 URL 전부 변경 | 검색 순위 일시 하락, 외부 백링크 깨짐 | 301 영구 리다이렉트, sitemap 재제출, 전환 후 2~4주 Search Console 모니터링 |
| 301 캐시의 비가역성 | 잘못된 규칙이 브라우저에 영구 캐시 | 스테이징에서는 307 유지, 경로 확정 후 프로덕션에서만 301 활성화 |
| OAuth 콜백 URL 변경 | 로그인 전체 실패 | Phase 0에서 백엔드 화이트리스트 선반영, Phase 1 배포 전 확인 |
| 게임 데이터 용량 2배 | 초기 로딩 지연, S3 전송 비용 | 버전 경로 + `immutable` 캐시, 브로틀리 압축, 경량 인덱스 분리 검토 |
| 영문 텍스트 길이 | 레이아웃 깨짐 | Phase 7 전용 점검, 고정폭 요소에 `truncate`/`min-w` 재검토 |
| `use cache` 비호환 | 향후 캐시 최적화 제약 | next-intl은 `getTranslations()`가 요청 헤더에 의존해 `use cache`와 함께 쓰기 어렵다. 현재 미사용이므로 문제없으나 도입 시 `next/root-params` 기반 우회 필요 |
| 800개 문자열 일괄 변경 | 리뷰 불가능한 대형 PR, 회귀 위험 | Phase 5를 슬라이스 단위 PR로 분할, 슬라이스별 ESLint 룰로 재유입 차단 |
| 번역 품질 | 게임 용어 오역 | LoL 공식 영문 용어 기준 (예: 정글=Jungle, 원딜=Bot/ADC, 자유 랭크=Flex) 용어집을 `docs/i18n-glossary.md`로 관리 |

---

## 8. 예상 작업량

| Phase | 내용 | 규모 |
| --- | --- | --- |
| 0 | 선행 결정 | 협의 |
| 1 | 라우팅 인프라 | 파일 25개 이동 + 신규 6개 |
| 2 | 게임 데이터 S3 | 스토어 1개 개편 + 설정 |
| 3 | 공통 레이어 | 파일 ~25개 |
| 4 | 도메인 상수/포맷 | 파일 ~10개 |
| 5 | 페이지별 번역 | **파일 ~110개, 문자열 ~700개** (전체의 80%) |
| 6 | SEO | 파일 ~18개 |
| 7 | 검증 | 스크립트 + 룰 + E2E |

---

## 9. 결정 필요 사항

Phase 1 착수 전에 확정해야 하는 항목:

1. **게임 데이터 버전을 어떻게 알아내는가** — 빌드 타임 환경변수 / S3 manifest(`latest.json`) / `/v1/seasons` API 중 택1. manifest 방식이 배포 없이 갱신 가능해 가장 유연하다.
2. **S3 경로 규약 확정** — `{host}/data/{version}/{ko_KR|en_US}/{file}.json` 형태가 맞는지, 실제 업로드된 경로와 일치하는지.
3. **백엔드 응답 문자열의 다국어화 여부** — 현재 `entities/*/api/`에서 `response.data.errorMessage`(서버 생성 한국어)를 그대로 노출한다. 세 가지 선택지:
   - (a) 백엔드가 `Accept-Language` 헤더를 받아 다국어 응답 → API 클라이언트 인터셉터에 헤더 추가
   - (b) 백엔드가 에러 **코드**를 반환하고 프론트가 번역 → 가장 견고, 백엔드 변경 필요
   - (c) 1차에서는 그대로 두고 프론트 fallback 메시지만 번역 → 가장 빠름
4. **커뮤니티 카테고리 등 서버 소유 열거값** — 라벨을 프론트에서 번역할지, 백엔드가 로케일별로 내려줄지.
5. **`/en` 기본 지역(region) 정책** — 영어 사용자의 기본 검색 지역을 KR로 둘지 NA로 둘지. `features/region-select` 기본값에 영향.
6. **약관·개인정보처리방침 영문본** — 법무 검토 주체와 일정.

---

## 10. 참고

- [next-intl — App Router with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)
- [Next.js 16 업그레이드 가이드 (`middleware.ts` → `proxy.ts`)](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [next-intl 릴리스 노트](https://github.com/amannn/next-intl/releases)
