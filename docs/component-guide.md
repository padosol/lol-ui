# 컴포넌트 작성 가이드

## 컴포넌트 구조

프로젝트는 Next.js 16 App Router와 React 19를 사용하며, TypeScript로 작성됩니다.

## 컴포넌트 위치

모든 재사용 가능한 컴포넌트는 `/src/components` 디렉토리에 저장합니다.

```
src/
└── components/
    ├── Header.tsx
    ├── Navigation.tsx
    ├── DesktopAppSection.tsx
    └── Footer.tsx
```

## 컴포넌트 작성 규칙

### 1. 파일 명명 규칙

- 컴포넌트 파일은 **PascalCase**로 작성합니다.
- 파일 확장자는 `.tsx`를 사용합니다.
- 예: `Header.tsx`, `SummonerCard.tsx`

### 2. 컴포넌트 기본 구조

```typescript
"use client"; // 클라이언트 컴포넌트인 경우

import { useState } from "react";
import { Search } from "lucide-react";

interface ComponentProps {
  title: string;
  optional?: string;
}

export default function Component({ title, optional }: ComponentProps) {
  const [state, setState] = useState("");

  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
}
```

### 3. 클라이언트 vs 서버 컴포넌트

#### 서버 컴포넌트 (기본)
- 상태나 이벤트 핸들러가 없는 경우
- 데이터 페칭이 필요한 경우
- `"use client"` 지시어 없이 작성

```typescript
// 서버 컴포넌트 예시
export default function Navigation() {
  return (
    <nav>
      {/* 정적 콘텐츠 */}
    </nav>
  );
}
```

#### 클라이언트 컴포넌트
- `useState`, `useEffect` 등 React Hooks 사용
- 이벤트 핸들러 사용
- 브라우저 API 사용
- `"use client"` 지시어를 파일 최상단에 추가

```typescript
"use client";

import { useState } from "react";

export default function SearchForm() {
  const [query, setQuery] = useState("");

  return (
    <form>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </form>
  );
}
```

### 4. Props 타입 정의

TypeScript 인터페이스를 사용하여 Props를 정의합니다.

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function Button({ 
  label, 
  onClick, 
  variant = "primary",
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### 5. 스타일링 규칙

- **Tailwind CSS**를 사용하여 스타일링합니다.
- 인라인 클래스명을 사용합니다.
- 반응형 디자인을 고려합니다.

```typescript
<div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow">
  {/* 콘텐츠 */}
</div>
```

### 6. 컴포넌트 예시

#### 간단한 컴포넌트 (서버 컴포넌트)

```typescript
// src/components/Navigation.tsx
export default function Navigation() {
  const navItems = [
    { label: "Champions", href: "/champions" },
    { label: "Stats", href: "/stats" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-700 hover:text-blue-600"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

#### 상태가 있는 컴포넌트 (클라이언트 컴포넌트)

```typescript
// src/components/SearchForm.tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchForm() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직
    console.log("Searching for:", query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}
```

#### React Query를 사용하는 컴포넌트

```typescript
// src/components/SummonerCard.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

interface SummonerCardProps {
  summonerName: string;
}

export default function SummonerCard({ summonerName }: SummonerCardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["summoner", summonerName],
    queryFn: async () => {
      const response = await fetch(`/api/summoner/${summonerName}`);
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2>{data.name}</h2>
      <p>Level: {data.level}</p>
    </div>
  );
}
```

## 컴포넌트 가져오기

경로 별칭 `@/`를 사용하여 컴포넌트를 가져옵니다.

```typescript
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
```

## 컴포넌트 작성 체크리스트

- [ ] 파일명이 PascalCase로 작성되었는가?
- [ ] TypeScript 인터페이스로 Props가 정의되었는가?
- [ ] 클라이언트 컴포넌트인 경우 `"use client"` 지시어가 있는가?
- [ ] Tailwind CSS 클래스를 사용하여 스타일링되었는가?
- [ ] 반응형 디자인이 고려되었는가?
- [ ] 접근성(accessibility)이 고려되었는가?
- [ ] 에러 처리가 구현되었는가?

## 베스트 프랙티스

1. **단일 책임 원칙**: 하나의 컴포넌트는 하나의 역할만 수행합니다.
2. **재사용성**: 공통으로 사용되는 UI는 컴포넌트로 분리합니다.
3. **Props 최소화**: 필요한 Props만 전달합니다.
4. **타입 안전성**: 모든 Props와 상태에 타입을 정의합니다.
5. **성능 최적화**: 불필요한 리렌더링을 방지합니다.

