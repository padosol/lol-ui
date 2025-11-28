# 개발 가이드

## 시작하기

### 필수 요구사항

- Node.js 20.11 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm start
```

### 린팅

```bash
npm run lint
```

## 프로젝트 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |

## 개발 워크플로우

### 1. 새 컴포넌트 생성

1. `/src/components` 디렉토리에 새 파일 생성
2. 컴포넌트 작성 (컴포넌트 가이드 참조)
3. 필요한 경우 페이지에서 import하여 사용

### 2. 새 페이지 생성

1. `/src/app` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 생성
3. 필요시 `layout.tsx` 생성

예시:
```
src/app/
└── summoner/
    └── [name]/
        └── page.tsx
```

### 3. API 라우트 생성

1. `/src/app/api` 디렉토리에 새 폴더 생성
2. `route.ts` 파일 생성

예시:
```typescript
// src/app/api/summoner/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // API 로직
  return NextResponse.json({ data: 'response' });
}
```

## 코드 스타일

### TypeScript

- 모든 파일은 TypeScript로 작성합니다.
- 타입을 명시적으로 정의합니다.
- `any` 타입 사용을 피합니다.

### 네이밍 규칙

- **컴포넌트**: PascalCase (`Header.tsx`, `SummonerCard.tsx`)
- **함수/변수**: camelCase (`handleSubmit`, `summonerName`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **인터페이스/타입**: PascalCase (`UserData`, `ApiResponse`)

### 파일 구조

```
src/
├── app/              # Next.js App Router
├── components/       # 재사용 가능한 컴포넌트
├── lib/             # 유틸리티 함수
├── hooks/           # 커스텀 React Hooks
├── types/           # TypeScript 타입 정의
└── stores/          # Zustand 스토어
```

## 상태 관리

### 클라이언트 상태 (Zustand)

전역 클라이언트 상태는 Zustand를 사용합니다.

```typescript
// src/stores/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  region: string;
  setRegion: (region: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  region: 'KR',
  setRegion: (region) => set({ region }),
}));
```

### 서버 상태 (React Query)

API 데이터는 React Query로 관리합니다.

```typescript
// src/hooks/useSummoner.ts
import { useQuery } from '@tanstack/react-query';

export function useSummoner(name: string) {
  return useQuery({
    queryKey: ['summoner', name],
    queryFn: () => fetchSummoner(name),
  });
}
```

## 환경 변수

`.env.local` 파일을 생성하여 환경 변수를 설정합니다.

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

환경 변수는 `NEXT_PUBLIC_` 접두사가 붙은 경우에만 클라이언트에서 접근 가능합니다.

## 에러 처리

### React Error Boundary

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return <div>Something went wrong: {error.message}</div>;
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

### API 에러 처리

```typescript
try {
  const response = await fetch('/api/summoner');
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
}
```

## 성능 최적화

### 이미지 최적화

Next.js Image 컴포넌트를 사용합니다.

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

### 코드 스플리팅

동적 import를 사용하여 코드 스플리팅을 수행합니다.

```typescript
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

## 테스트 (향후 추가 예정)

프로젝트에 테스트 프레임워크를 추가할 예정입니다.

## 디버깅

### React Query DevTools

개발 환경에서 React Query 상태를 확인할 수 있습니다.

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// layout.tsx 또는 루트 컴포넌트에 추가
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

## Git 워크플로우

1. 새 기능 브랜치 생성: `git checkout -b feature/new-feature`
2. 변경사항 커밋: `git commit -m "Add new feature"`
3. 브랜치 푸시: `git push origin feature/new-feature`
4. Pull Request 생성

## 배포

프로젝트는 Vercel에 배포할 수 있습니다.

1. GitHub 저장소에 푸시
2. Vercel에 프로젝트 연결
3. 자동 배포 설정

## 문제 해결

### 일반적인 문제

1. **의존성 오류**: `rm -rf node_modules package-lock.json && npm install`
2. **빌드 오류**: `.next` 폴더 삭제 후 재빌드
3. **타입 오류**: `npm run build`로 타입 체크

## 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)

