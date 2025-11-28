# 스타일링 가이드

## Tailwind CSS v4

프로젝트는 **Tailwind CSS v4**를 사용합니다.

## 설정 파일

### PostCSS 설정 (`postcss.config.mjs`)

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### 전역 스타일 (`src/app/globals.css`)

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
```

## Tailwind CSS 사용법

### 기본 사용

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### 반응형 디자인

Tailwind의 반응형 브레이크포인트를 사용합니다:

- `sm`: 640px 이상
- `md`: 768px 이상
- `lg`: 1024px 이상
- `xl`: 1280px 이상
- `2xl`: 1536px 이상

```typescript
<div className="flex flex-col md:flex-row gap-4">
  {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
</div>
```

### 색상 팔레트

프로젝트에서 주로 사용하는 색상:

- **Primary**: `blue-600`, `blue-700` (버튼, 링크)
- **Background**: `white`, `gray-50`, `gray-900`
- **Text**: `gray-700`, `gray-900`, `white`
- **Border**: `gray-200`, `gray-300`

```typescript
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  Button
</button>
```

### 레이아웃 유틸리티

#### Flexbox

```typescript
<div className="flex items-center justify-between gap-4">
  {/* 가로 정렬, 수직 중앙, 양쪽 끝 정렬, 간격 4 */}
</div>
```

#### Grid

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 반응형 그리드 */}
</div>
```

#### Container

```typescript
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* 최대 너비 제한, 중앙 정렬, 반응형 패딩 */}
</div>
```

### 스페이싱

일관된 간격을 위해 Tailwind의 spacing scale을 사용합니다:

- `gap-2`: 0.5rem (8px)
- `gap-4`: 1rem (16px)
- `gap-6`: 1.5rem (24px)
- `p-4`: 패딩 1rem
- `px-4`: 좌우 패딩 1rem
- `py-6`: 상하 패딩 1.5rem

### 타이포그래피

```typescript
<h1 className="text-3xl font-bold text-gray-900">Heading 1</h1>
<h2 className="text-2xl font-semibold text-gray-800">Heading 2</h2>
<p className="text-base text-gray-700">Body text</p>
<p className="text-sm text-gray-600">Small text</p>
```

### 상태 스타일

#### Hover

```typescript
<button className="bg-blue-600 hover:bg-blue-700 transition-colors">
  Hover me
</button>
```

#### Focus

```typescript
<input className="focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

#### Active

```typescript
<button className="active:scale-95 transition-transform">
  Click me
</button>
```

## 커스텀 스타일

필요한 경우 `globals.css`에 커스텀 스타일을 추가할 수 있습니다.

```css
@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  }
}
```

## 다크 모드

현재 프로젝트는 `prefers-color-scheme` 미디어 쿼리를 사용하여 다크 모드를 지원합니다.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0aa;
    --foreground: #ededed;
  }
}
```

## 아이콘 스타일링

Lucide React 아이콘은 Tailwind 클래스로 스타일링할 수 있습니다.

```typescript
import { Search } from "lucide-react";

<Search className="w-5 h-5 text-gray-600" />
```

## 베스트 프랙티스

1. **일관성**: 프로젝트 전체에서 동일한 스타일 패턴을 사용합니다.
2. **반응형**: 모바일부터 데스크톱까지 모든 화면 크기를 고려합니다.
3. **접근성**: 충분한 색상 대비와 포커스 스타일을 제공합니다.
4. **성능**: 불필요한 커스텀 CSS를 피하고 Tailwind 유틸리티를 우선 사용합니다.
5. **가독성**: 긴 클래스명은 여러 줄로 나누어 작성합니다.

```typescript
// 좋은 예
<button className="
  px-6 py-3 
  bg-blue-600 hover:bg-blue-700 
  text-white 
  rounded-lg 
  transition-colors
">
  Button
</button>
```

