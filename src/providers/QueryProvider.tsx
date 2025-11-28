'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClient를 useState로 생성하여 컴포넌트가 리렌더링되어도 동일한 인스턴스 유지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 에러 발생 시 자동 재시도 설정
            retry: 1,
            // 네트워크가 다시 연결되었을 때 자동으로 쿼리 재시도
            refetchOnWindowFocus: false,
            // 기본 staleTime 설정
            staleTime: 5 * 60 * 1000, // 5분
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 React Query DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

