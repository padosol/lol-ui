# React Query 훅

이 디렉토리는 React Query를 사용한 커스텀 훅들을 관리합니다.

## 사용 예시

### 소환사 프로필 조회

```typescript
"use client";

import { useSummonerProfile } from "@/hooks/useSummoner";

export default function ProfileComponent({
  summonerName,
}: {
  summonerName: string;
}) {
  const { data, isLoading, error, refetch } = useSummonerProfile(summonerName);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>레벨: {data.level}</p>
      <button onClick={() => refetch()}>새로고침</button>
    </div>
  );
}
```

### 매치 히스토리 조회

```typescript
"use client";

import { useMatchHistory } from "@/hooks/useSummoner";

export default function MatchHistoryComponent({
  summonerName,
}: {
  summonerName: string;
}) {
  const { data: matches, isLoading } = useMatchHistory(summonerName, 1, 20);

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      {matches?.map((match) => (
        <div key={match.id}>
          <p>
            {match.champion} - {match.result}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### 데이터 새로고침

```typescript
"use client";

import { useRefreshSummonerData } from "@/hooks/useSummoner";

export default function RefreshButton({
  summonerName,
}: {
  summonerName: string;
}) {
  const { mutate: refresh, isPending } = useRefreshSummonerData();

  const handleRefresh = () => {
    refresh(summonerName, {
      onSuccess: () => {
        console.log("새로고침 완료");
      },
      onError: (error) => {
        console.error("새로고침 실패:", error);
      },
    });
  };

  return (
    <button onClick={handleRefresh} disabled={isPending}>
      {isPending ? "새로고침 중..." : "새로고침"}
    </button>
  );
}
```

## React Query Provider 설정

`src/app/layout.tsx`에서 QueryProvider로 감싸야 합니다:

```typescript
import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```
