# 라이브러리 및 의존성

## 프로젝트 정보

- **프로젝트명**: lol-ui-next
- **버전**: 0.1.0
- **프레임워크**: Next.js 16.0.3
- **React 버전**: 19.2.0
- **TypeScript**: 5.x

## 핵심 의존성 (Dependencies)

### 프레임워크 및 런타임
- **next** `^16.0.3`: Next.js 프레임워크
- **react** `^19.2.0`: React 라이브러리
- **react-dom** `^19.2.0`: React DOM 렌더러

### 상태 관리
- **zustand** `^4.5.0`: 경량 상태 관리 라이브러리
  - 클라이언트 사이드 상태 관리에 사용
  - 보일러플레이트 없이 간단한 API 제공

### 데이터 페칭 및 서버 상태
- **@tanstack/react-query** `^5.0.0`: 서버 상태 관리 및 데이터 페칭
  - API 데이터 캐싱, 리프레시, 동기화 기능
  - 서버 상태와 클라이언트 상태를 분리하여 관리

### HTTP 클라이언트
- **axios** `^1.6.0`: HTTP 클라이언트 라이브러리
  - API 요청 처리
  - 인터셉터, 에러 핸들링 지원

### 폼 관리 및 유효성 검사
- **react-hook-form** `^7.50.0`: 성능 최적화된 폼 관리 라이브러리
  - 최소한의 리렌더링으로 폼 상태 관리
  - 검색 폼, 사용자 입력 폼 등에 사용

- **zod** `^3.22.0`: TypeScript-first 스키마 유효성 검사 라이브러리
  - react-hook-form과 통합하여 타입 안전한 폼 검증
  - API 응답 데이터 검증에도 사용 가능

### 데이터 시각화
- **react-chartjs-2** `^5.2.0`: Chart.js의 React 래퍼
  - 전적 데이터 차트 및 그래프 표시에 사용

- **chart.js** `^4.4.0`: 차트 라이브러리
  - 다양한 차트 타입 지원 (Line, Bar, Pie 등)
  - 인터랙티브 차트 생성

### 유틸리티
- **dayjs** `^1.11.0`: 경량 날짜/시간 처리 라이브러리
  - Moment.js의 경량 대안
  - 게임 시간, 매치 날짜 등 날짜 포맷팅에 사용

- **lucide-react** `^0.344.0`: 아이콘 라이브러리
  - React 컴포넌트로 제공되는 아이콘 세트
  - 검색, 메뉴 등 UI 아이콘에 사용

### 에러 처리
- **react-error-boundary** `^4.0.0`: React 에러 바운더리 컴포넌트
  - 컴포넌트 트리에서 발생하는 에러를 캐치하고 처리
  - 사용자 친화적인 에러 UI 제공

## 개발 의존성 (DevDependencies)

### 스타일링
- **tailwindcss** `^4`: 유틸리티 우선 CSS 프레임워크
- **@tailwindcss/postcss** `^4`: Tailwind CSS PostCSS 플러그인

### 개발 도구
- **@tanstack/react-query-devtools** `^5.0.0`: React Query 개발자 도구
  - 개발 환경에서 React Query 상태를 시각적으로 확인

### 타입 정의
- **@types/node** `^20`: Node.js 타입 정의
- **@types/react** `^19`: React 타입 정의
- **@types/react-dom** `^19`: React DOM 타입 정의

### 린팅 및 코드 품질
- **eslint** `^9`: JavaScript/TypeScript 린터
- **eslint-config-next** `16.0.3`: Next.js ESLint 설정

### 빌드 도구
- **typescript** `^5`: TypeScript 컴파일러

## 라이브러리 사용 가이드

### 상태 관리 (Zustand)

```typescript
import { create } from 'zustand';

interface StoreState {
  region: string;
  setRegion: (region: string) => void;
}

const useStore = create<StoreState>((set) => ({
  region: 'KR',
  setRegion: (region) => set({ region }),
}));
```

### 데이터 페칭 (React Query)

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['summoner', name],
  queryFn: () => fetchSummonerData(name),
});
```

### 폼 관리 (React Hook Form + Zod)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  summonerName: z.string().min(1),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### 날짜 처리 (Day.js)

```typescript
import dayjs from 'dayjs';

const formatted = dayjs(date).format('YYYY-MM-DD HH:mm');
```

### 아이콘 (Lucide React)

```typescript
import { Search, Menu, User } from 'lucide-react';

<Search className="w-5 h-5" />
```

