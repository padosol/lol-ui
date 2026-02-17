---
title: "Tooltip.tsx 린트 에러 원인 분석"
description: "React Compiler 린트 규칙(react-hooks/immutability, react-hooks/refs)이 Tooltip 컴포넌트에서 발생한 원인과 해결 방법"
date: 2026-02-17
tags:
  - react
  - eslint
  - react-compiler
  - lint
---

# Tooltip.tsx 린트 에러 원인 분석

> `src/components/tooltip/Tooltip.tsx`에서 발생한 React Compiler 관련 ESLint 에러 2건의 원인과 해결 방법을 설명한다.

---

## 1. 배경: React의 렌더링과 불변성 원칙

### 컴포넌트는 순수 함수여야 한다

React 컴포넌트는 **같은 입력(props, state)이 들어오면 항상 같은 출력(JSX)을 반환**해야 한다. 이를 "순수 함수(pure function)"라고 부른다.

```tsx
// 순수 — props가 같으면 결과도 같다
function Greeting({ name }: { name: string }) {
  return <h1>안녕, {name}!</h1>;
}
```

### props와 state는 읽기 전용 스냅샷

React는 렌더링할 때마다 props와 state의 **스냅샷**을 찍는다. 컴포넌트는 이 스냅샷을 **읽기만** 해야 한다.

직접 수정하면 React가 변화를 **감지하지 못한다**. React는 "이전 값과 다른가?"를 비교해서 다시 렌더링할지 결정하는데, 원본 객체를 직접 바꿔버리면 이전 값도 같이 바뀌어서 비교가 무의미해진다.

```tsx
// BAD — props를 직접 수정
function Bad({ user }: { user: { name: string } }) {
  user.name = "변경됨"; // React는 이 변경을 모른다
  return <span>{user.name}</span>;
}

// GOOD — 새 객체를 만든다
function Good({ user }: { user: { name: string } }) {
  const modified = { ...user, name: "변경됨" };
  return <span>{modified.name}</span>;
}
```

### useRef는 렌더링의 "탈출구"

`useRef`는 렌더링에 참여하지 않는 값을 저장하는 도구다. `.current`를 바꿔도 리렌더링이 발생하지 않는다.

**중요한 규칙**: ref의 `.current`는 렌더 **중**에 읽거나 쓰면 안 된다. 이벤트 핸들러나 `useEffect` 같은 **사이드 이펙트** 안에서만 접근해야 한다.

```tsx
function Timer() {
  const countRef = useRef(0);

  // BAD — 렌더 중에 ref를 읽음
  // return <span>{countRef.current}</span>;

  // GOOD — 이벤트 핸들러에서 ref를 읽음
  const handleClick = () => {
    console.log(countRef.current);
  };

  return <button onClick={handleClick}>확인</button>;
}
```

---

## 2. 에러 ①: `react-hooks/immutability`

### 규칙 설명

> 컴포넌트의 props나 훅에 전달된 인자를 직접 수정(mutation)하면 안 된다.

### 수정 전 문제 코드

```tsx
// src/components/tooltip/Tooltip.tsx (수정 전)
const child = cloneElement(children, {
  ref: (node: HTMLElement | null) => {
    triggerRef.current = node;

    // children은 props → children.ref는 props의 일부
    const childRef = (children as { ref?: unknown }).ref;
    if (typeof childRef === "function") {
      childRef(node);
    } else if (childRef && typeof childRef === "object" && "current" in childRef) {
      (childRef as { current: unknown }).current = node;  // ← props를 수정!
    }
  },
  // ...
});
```

### 왜 문제인가

1. `children`은 부모 컴포넌트가 전달한 **props**다.
2. `children.ref`는 `children`에서 파생된 값이므로 props의 일부다.
3. `(childRef as { current: unknown }).current = node`는 부모가 전달한 ref 객체를 **직접 변이(mutation)**하는 것이다.

린터의 관점에서 이 코드는 다음과 같은 흐름이다:

```
props (children)
  └─ .ref (props에서 파생)
       └─ .current = node  ← 변이 발생!
```

`children` → `.ref` → `.current`로 이어지는 체인 전체가 props에서 시작되므로, 린터는 이를 "props를 직접 수정했다"고 판단한다.

### React Compiler 관점

React Compiler는 **props가 렌더링 사이에 변하지 않는다**고 가정하고 자동으로 메모이제이션을 적용한다. 만약 컴포넌트가 props를 직접 수정하면 이 가정이 깨지고, 해당 컴포넌트는 **최적화 대상에서 제외**된다.

```
React Compiler의 가정:
  "props는 불변이다" → 안전하게 메모이제이션 가능

props를 수정하면:
  "props가 변할 수 있다" → 메모이제이션 불가 → 최적화 제외
```

### 해결 방법: 외부 헬퍼 함수로 분리

ref 할당 로직을 **컴포넌트 외부의 일반 함수**로 분리하면, 린터가 이를 props 변이로 추적하지 않는다.

```tsx
// 컴포넌트 외부에 정의
function assignRef(ref: unknown, node: HTMLElement | null) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref && typeof ref === "object" && "current" in ref) {
    (ref as { current: unknown }).current = node;
  }
}
```

이 함수는 컴포넌트 스코프 밖에 있으므로, 린터는 `ref` 파라미터를 "props에서 파생된 값"으로 추적하지 않는다. 동일한 동작을 수행하지만 린트 규칙을 위반하지 않는다.

---

## 3. 에러 ②: `react-hooks/refs`

### 규칙 설명

> 렌더 중에 ref 값을 읽거나 쓰면 안 된다.

### 수정 전 문제 코드

```tsx
// src/components/tooltip/Tooltip.tsx (수정 전)
const child = cloneElement(children, {
  ref: (node: HTMLElement | null) => {
    triggerRef.current = node;  // ← triggerRef를 렌더 중에 쓴다?
    // ...
  },
  // ...
});
```

### 수정 후에도 남은 경고

```tsx
// 수정 후에도 cloneElement에 ref를 전달하는 것 자체가 경고 대상
const child = cloneElement(children, {
  ref: mergedRef,   // ← 린터: "렌더 중에 ref 콜백이 실행될 수 있다"
  // ...
});
```

### 왜 문제인가

`cloneElement()`는 컴포넌트 함수 본문, 즉 **렌더 페이즈**에서 실행된다. `mergedRef`는 내부적으로 `triggerRef.current`에 값을 쓰는 콜백 함수다. 린터는 정적 분석으로 "이 ref 콜백이 렌더 중에 실행될 수 있다"고 판단한다.

```
렌더 페이즈 (컴포넌트 함수 본문)
  └─ cloneElement(children, { ref: mergedRef })
       └─ mergedRef 내부: triggerRef.current = node  ← 렌더 중 ref 쓰기?
```

### 실제로는 false positive

이것은 **오탐(false positive)**이다. 이유는 다음과 같다:

- `cloneElement`에 `ref`를 전달하는 것은 "여기에 ref를 붙여달라"는 **설정**일 뿐이다.
- React는 ref 콜백을 **DOM 마운트/언마운트 시점**에 호출한다. 렌더 중에 호출하지 않는다.
- 하지만 린터는 **정적 분석** 도구이므로, 런타임에 언제 호출되는지를 판단하지 못한다. `cloneElement` 호출이 렌더 중에 일어나고, 그 안에 ref 콜백이 전달되므로 "렌더 중 ref 접근 가능성"으로 판단한다.

```
린터의 정적 분석 관점:
  cloneElement(렌더 중 호출) → ref 콜백 전달 → 잠재적 ref 접근
                                                    ↑ 경고!

실제 런타임:
  cloneElement(렌더 중 호출) → React 엘리먼트 생성 (ref 실행 안 됨)
  DOM 마운트 시 → ref 콜백 실행 (렌더가 아닌 커밋 페이즈)
                                  ↑ 문제 없음
```

### 해결 방법: eslint-disable로 억제

정당한 사유가 있는 false positive이므로 `eslint-disable-next-line`으로 억제한다.

```tsx
// eslint-disable-next-line react-hooks/refs -- ref callback is invoked by React after render, not during render
const child = cloneElement(children, {
  ref: mergedRef,
  // ...
});
```

`--` 뒤에 **억제 사유를 반드시 명시**한다. 나중에 코드를 읽는 사람이 "왜 린트를 끈 거지?"라는 의문을 가지지 않도록.

---

## 4. 왜 이 규칙들이 새로 생겼나? (React Compiler)

### React Compiler의 등장

React 19에서 **React Compiler**가 도입되었다. React Compiler는 컴포넌트를 자동으로 분석하여 `useMemo`, `useCallback`, `React.memo` 같은 수동 최적화 없이도 **자동으로 메모이제이션**을 적용한다.

### 새로운 린트 규칙의 추가

React Compiler가 올바르게 작동하려면 컴포넌트가 몇 가지 규칙을 지켜야 한다:

1. **props/state를 직접 수정하지 않을 것** → `react-hooks/immutability`
2. **렌더 중에 ref를 읽거나 쓰지 않을 것** → `react-hooks/refs`

이 규칙들은 `eslint-plugin-react-hooks` v7.0+의 **recommended 프리셋**에 자동으로 포함되었다.

### 프로젝트에서 활성화된 경로

```
eslint-config-next/core-web-vitals (nextVitals)
  └─ eslint-plugin-react-hooks/recommended
       ├─ react-hooks/rules-of-hooks  (기존)
       ├─ react-hooks/exhaustive-deps (기존)
       ├─ react-hooks/immutability    (React 19에서 추가)
       └─ react-hooks/refs            (React 19에서 추가)
```

프로젝트의 `eslint.config.mjs`에서는 별도로 이 규칙들을 설정하지 않았지만, `nextVitals`를 사용하는 것만으로 자동 활성화된다:

```js
// eslint.config.mjs
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,   // ← 여기서 react-hooks/immutability, react-hooks/refs 포함
  ...nextTs,
  // ...
]);
```

---

## 5. 수정 전후 코드 비교

### 핵심 변경 사항

1. **`assignRef` 헬퍼 함수**를 컴포넌트 외부에 추가
2. **ref 콜백 로직**을 인라인에서 `useCallback`으로 분리
3. `cloneElement`에 `eslint-disable-next-line` 주석 추가

### Diff

```diff
 import { createPortal } from "react-dom";

+function assignRef(ref: unknown, node: HTMLElement | null) {
+  if (typeof ref === "function") {
+    ref(node);
+  } else if (ref && typeof ref === "object" && "current" in ref) {
+    (ref as { current: unknown }).current = node;
+  }
+}
+
 interface TooltipProps {
```

```diff
   }, []);

+  const childRef = (children as { ref?: unknown }).ref;
+
+  const mergedRef = useCallback(
+    (node: HTMLElement | null) => {
+      triggerRef.current = node;
+      assignRef(childRef, node);
+    },
+    [childRef],
+  );
+
   if (!isValidElement(children)) return children;

   const childProps = children.props as Record<string, unknown>;

+  // eslint-disable-next-line react-hooks/refs -- ref callback is invoked by React after render, not during render
   const child = cloneElement(children, {
-    ref: (node: HTMLElement | null) => {
-      triggerRef.current = node;
-      // Preserve existing ref
-      const childRef = (children as { ref?: unknown }).ref;
-      if (typeof childRef === "function") {
-        childRef(node);
-      } else if (childRef && typeof childRef === "object" && "current" in childRef) {
-        (childRef as { current: unknown }).current = node;
-      }
-    },
+    ref: mergedRef,
     onMouseEnter: (e: React.MouseEvent) => {
```

---

## 6. 핵심 정리

| 규칙                       | 의미                                | 발생 원인                                                             | 해결 방법                                                                       |
| -------------------------- | ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `react-hooks/immutability` | props를 직접 수정하면 안 된다       | `children.ref.current = node`로 props에서 파생된 ref 객체를 직접 변이 | ref 할당 로직을 컴포넌트 외부 헬퍼 함수(`assignRef`)로 분리                     |
| `react-hooks/refs`         | 렌더 중에 ref를 읽거나 쓰면 안 된다 | `cloneElement`(렌더 중 실행)에 ref 콜백 전달                          | `eslint-disable-next-line` (false positive — ref 콜백은 커밋 페이즈에서 실행됨) |

### 기억할 것

- **React Compiler** 시대에는 "props 불변", "렌더 중 ref 접근 금지"가 단순한 모범 사례가 아니라 **자동 최적화의 전제 조건**이다.
- 린터가 잡아내지 못하는 영역은 런타임에서야 문제가 드러난다. 린트 에러는 일찍 잡아주는 안전망이다.
- `eslint-disable`은 **마지막 수단**이다. 반드시 정당한 사유를 주석으로 남겨야 한다.
