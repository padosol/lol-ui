# 챔피언 통계 테이블 승률/KDA 컬럼 스타일 조정

## Context
이전 작업에서 10컬럼 → 6컬럼 간소화 완료됨. 승률 폰트 크기 축소, KDA 컬럼 텍스트 크기 축소 + 가운데 정렬 필요.

## 수정 파일
- `src/widgets/summoner-profile/ui/ChampionStats.tsx`

## 변경 사항 (3곳)

### 1. 승률 바디 `<td>` (296행) — 폰트 크기 축소
```diff
- <span className="text-on-surface font-semibold">
+ <span className="text-xs text-on-surface font-semibold">
```

### 2. KDA 헤더 `<th>` (243행) — 가운데 정렬
```diff
- className="... text-right ..."
+ className="... text-center ..."
```

### 3. KDA 바디 `<td>` (301행) — 가운데 정렬 + 텍스트 크기 축소
```diff
- <td className="... text-right">
-   <div className="text-sm font-semibold text-on-surface">
+ <td className="... text-center">
+   <div className="text-xs font-semibold text-on-surface">
```

## 검증
- `pnpm build` + `pnpm lint`
