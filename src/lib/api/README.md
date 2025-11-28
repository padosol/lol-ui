# API 호출 구조

이 디렉토리는 백엔드 API를 호출하는 함수들을 관리합니다.

## 파일 구조

```
src/
├── lib/
│   └── api/
│       ├── client.ts          # axios 인스턴스 설정
│       └── summoner.ts        # 소환사 관련 API 함수
├── hooks/
│   └── useSummoner.ts         # React Query 훅
└── types/
    └── api.ts                 # API 타입 정의
```

## 사용 방법

### 1. React Query 훅 사용 (권장)

컴포넌트에서 React Query 훅을 사용하여 데이터를 가져옵니다:

```typescript
import { useSummonerProfile, useMatchHistory } from "@/hooks/useSummoner";

export default function MyComponent({
  summonerName,
}: {
  summonerName: string;
}) {
  const { data, isLoading, error } = useSummonerProfile(summonerName);
  const { data: matches } = useMatchHistory(summonerName, 1, 20);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return <div>{data?.name}</div>;
}
```

### 2. 직접 API 함수 호출

필요한 경우 API 함수를 직접 호출할 수도 있습니다:

```typescript
import { getSummonerProfile } from "@/lib/api/summoner";

const profile = await getSummonerProfile("소환사이름");
```

## 환경 변수 설정

`.env.local` 파일에 API URL을 설정하세요:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

설정하지 않으면 기본값 `http://localhost:3001/api`를 사용합니다.

## 새로운 API 엔드포인트 추가하기

1. `src/lib/api/` 디렉토리에 새로운 파일 생성 (예: `match.ts`)
2. `src/types/api.ts`에 타입 정의 추가
3. `src/hooks/` 디렉토리에 React Query 훅 추가 (선택사항)
