# 컴포넌트 작성 가이드

새 컴포넌트를 만들 때 어느 FSD 레이어에 둘지 결정하는 흐름.
전체 레이어 정의는 [project-structure.md](./project-structure.md).

## 3단계 결정 트리

새 컴포넌트가 생기면 위에서부터 차례로 답한다 — 처음 "예" 가 나오는 줄에 둔다.

1. **도메인 지식이 없는 순수 UI 프리미티브인가?** (버튼, 툴팁, 입력 컴포넌트, 라벨…)
   → `src/shared/ui/<name>/`
   - 예: `shared/ui/tooltip`, `shared/ui/lane-selector`, `shared/ui/vote-buttons`

2. **하나의 도메인 엔티티만 표현하는가?** (해당 entity 의 데이터를 받아 렌더만 함)
   → `src/entities/<entity>/ui/`
   - 예: `entities/champion/ui/ChampionIcon`, `entities/summoner/ui/SummonerName`

3. **사용자 인터랙션/기능 단위인가?** (검색, 필터, 토글, 수정 폼…)
   → `src/features/<feature-name>/`
   - `model/` (스토어/훅) + `ui/` (컴포넌트) + `index.ts` 로 외부 노출
   - 예: `features/summoner-search`, `features/match-filter`, `features/theme-toggle`

4. **여러 features 를 조립한 페이지 블록인가?** (한 영역을 통째로 차지하는 복합 UI)
   → `src/widgets/<widget-name>/`
   - 예: `widgets/match-history`, `widgets/summoner-profile`, `widgets/champion-stats-panel`

5. **하나의 라우트(페이지) 전체인가?**
   → `src/views/<route>/ui/<Name>PageClient.tsx` ("use client")
   - `app/<route>/page.tsx` 에서 위임 호출.
   - 순수 SSR 페이지(patch-notes 등)는 예외로 `app/` 에 직접 둘 수 있다.

## 의존성 규칙 (위반 금지)

```
app → views → widgets → features → entities → shared
```

- 동일 레이어 끼리 import 도 가급적 피한다 (cross-feature import 는 코드 결합도를 높인다).
- 하위 → 상위 import 는 절대 금지 (`shared/ui/Foo` 가 `features/...` 를 import 하면 안 됨).
- 외부 노출은 `index.ts` 로만 — 내부 구현 경로 직접 import 지양.

## 클라이언트 / 서버 컴포넌트

- 기본은 서버 컴포넌트. 상태/이벤트/브라우저 API 가 필요할 때만 `"use client"` 추가.
- `views/*/ui/*PageClient.tsx` 는 관례적으로 client. SSR 페이지는 `app/` 에 머문다.
