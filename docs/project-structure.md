# 파일 구조

## 프로젝트 루트 구조

```
lol-ui-next/
├── docs/                    # 프로젝트 문서
├── public/                  # 정적 파일 (이미지, 아이콘 등)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                     # 소스 코드
│   ├── app/                # Next.js App Router
│   │   ├── favicon.ico
│   │   ├── globals.css     # 전역 스타일
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   └── page.tsx        # 홈 페이지
│   └── components/         # 재사용 가능한 컴포넌트
│       ├── Header.tsx
│       ├── Navigation.tsx
│       ├── DesktopAppSection.tsx
│       └── Footer.tsx
├── .next/                  # Next.js 빌드 출력 (자동 생성)
├── node_modules/           # 의존성 패키지
├── eslint.config.mjs       # ESLint 설정
├── next.config.ts          # Next.js 설정
├── next-env.d.ts          # Next.js 타입 정의
├── package.json            # 프로젝트 의존성 및 스크립트
├── package-lock.json       # 의존성 잠금 파일
├── postcss.config.mjs      # PostCSS 설정
├── tsconfig.json           # TypeScript 설정
└── README.md               # 프로젝트 README
```

## 디렉토리 설명

### `/src/app`
Next.js 16 App Router를 사용하는 디렉토리입니다.

- **`layout.tsx`**: 루트 레이아웃 컴포넌트. 모든 페이지에 공통으로 적용됩니다.
- **`page.tsx`**: 홈 페이지 컴포넌트.
- **`globals.css`**: 전역 CSS 스타일 및 Tailwind CSS import.

### `/src/components`
재사용 가능한 React 컴포넌트들을 저장하는 디렉토리입니다.

- **`Header.tsx`**: 상단 헤더 및 검색 영역 컴포넌트
- **`Navigation.tsx`**: 네비게이션 바 컴포넌트
- **`DesktopAppSection.tsx`**: Desktop 앱 소개 섹션 컴포넌트
- **`Footer.tsx`**: 푸터 컴포넌트

### `/public`
정적 파일들을 저장하는 디렉토리입니다. 이미지, 아이콘, 폰트 등을 저장합니다.

### `/docs`
프로젝트 문서를 저장하는 디렉토리입니다.

## TypeScript 경로 별칭

프로젝트는 TypeScript 경로 별칭을 사용합니다:

- `@/*` → `./src/*`

예시:
```typescript
import Header from "@/components/Header";
```

