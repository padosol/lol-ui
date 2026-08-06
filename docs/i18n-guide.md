# i18n 작업 가이드 (MP-107)

METAPICK UI 는 [next-intl](https://next-intl.dev) 로 한국어(`ko`)·영어(`en`) 를 지원한다.
이 문서는 "새 문자열을 추가할 때 무엇을 어디에 쓰는가" 만 다룬다. 설계 배경은 MP-107 이슈를 참고.

## 1. 구조

```
src/shared/i18n/
├── locale.ts       # LOCALES / DEFAULT_LOCALE / toLocale() 등 로케일 단일 출처
├── routing.ts      # defineRouting (localePrefix: "always")
├── request.ts      # 요청별 메시지 로딩
├── navigation.ts   # 로케일을 아는 Link / useRouter / usePathname
├── alternates.ts   # canonical + hreflang 생성
├── sitemap.ts      # 사이트맵 로케일 확장
└── messages/
    ├── ko.json     # 기준 로케일
    └── en.json
```

라우팅은 `src/proxy.ts` 가 담당한다 (Next.js 16 은 `middleware.ts` 가 아니라 `proxy.ts`).

## 2. 문자열 추가하기

1. `messages/ko.json` 에 키를 추가하고, `messages/en.json` 에 같은 키를 추가한다.
2. 컴포넌트에서 `useTranslations("<네임스페이스>")` 로 가져온다.

```tsx
const t = useTranslations("duo");
return <h1>{t("title")}</h1>;
```

서버 컴포넌트·`generateMetadata` 에서는 `next-intl/server` 의 `getTranslations` 를 쓴다.

```tsx
const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.duo" });
```

`params` 의 `locale` 은 `string` 이므로 `toLocale()` 로 좁혀서 넘긴다.

### 네임스페이스 기준

| 네임스페이스 | 용도 |
| --- | --- |
| `common` | 취소·저장·삭제 등 화면과 무관한 공통 동작 |
| `domain.*` | 서버 코드값의 표시 이름 (티어·포지션·게임 모드·상태 등) |
| `meta.*` | `<title>` / `description` 등 SEO 메타데이터 |
| `legal.*` | 이용약관·개인정보처리방침 본문 |
| 그 외 | 화면 단위 (`home`, `match`, `duo`, `community`, `patchNotes` …) |

**서버가 내려주는 코드값(`CHALLENGER`, `PENDING`, `TOP` …)의 라벨은 반드시 `domain.*` 에 둔다.**
`entities/*/types.ts` 에 `XXX_LABELS` 상수를 만들지 말 것 — 그런 상수는 번역이 불가능하다.

## 3. 하지 말 것

### 한국어를 코드에 직접 쓰기

ESLint 룰(`no-restricted-syntax`)이 `app`/`views`/`widgets`/`features`/`entities` 에서
JSX 텍스트·문자열 리터럴·템플릿 문자열의 한국어를 경고한다.
개발자 로그처럼 사용자에게 안 보이는 문자열만 사유를 적어 `eslint-disable-next-line` 한다.

### 날짜·상대시간 직접 포맷하기

`toLocaleDateString("ko-KR")` 이나 `${n}분 전` 같은 문자열을 만들지 말고
`useFormatter()` 를 쓴다.

```tsx
const format = useFormatter();
format.relativeTime(new Date(post.createdAt));      // "3분 전" / "3 minutes ago"
format.dateTime(date, { dateStyle: "short" });
```

### zod 스키마에 한국어 메시지 넣기

스키마를 팩토리로 만들고 번역 함수를 주입한다.

```ts
export function createDuoRequestSchema(t: TranslateValidation) {
  return z.object({
    primaryLane: z.enum(LANES, { message: t("primaryLaneRequired") }),
  });
}
```

```tsx
const tValidation = useTranslations("duo.validation");
const schema = useMemo(() => createDuoRequestSchema(tValidation), [tValidation]);
```

## 4. 검증

```bash
pnpm i18n:check          # ko/en 키 집합·타입 일치 검사 (CI + pre-commit)
pnpm lint                # 하드코딩 한국어 경고
npx playwright test tests/i18n.spec.ts
```

`pnpm i18n:check` 는 기준 로케일 `ko` 대비 누락/초과/타입 불일치 키를 모두 잡는다.

## 5. 아직 번역되지 않는 것

| 대상 | 이유 |
| --- | --- |
| 챔피언·아이템·룬·스펠 이름 | `public/data/*.json` 이 한국어 고정. 다국어 게임 데이터 API (MP-106) 이후 대응 |
| 패치노트 본문 | 크롤링한 원문이 한국어. 위와 동일 |
| `shared/mocks/patchNoteMock.ts` | 목업 데이터 |
| `widgets/summoner-profile/ui/FanLetter.tsx` | 탭이 비활성화된 미도달 컴포넌트 |
| 영문 약관·방침 | 초안 상태. `/en` 정식 공개 전 법무 검토 필요 |
