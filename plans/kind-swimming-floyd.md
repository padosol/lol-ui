# 모바일 ChampionStats UI 수정

## Context
유저 상세 페이지의 "챔피언 통계" 탭에서 모바일 환경 시 테이블이 너무 넓어 가독성이 떨어짐. padding 축소 및 챔피언명 제거로 모바일 UX 개선.

## 수정 대상 파일

### 1. `src/widgets/summoner-profile/ui/ProfileTabs.tsx` (line 99)
- 챔피언 통계 탭 래퍼의 `p-6` → `p-0 md:p-6` (모바일에서 외부 padding 제거)

### 2. `src/widgets/summoner-profile/ui/ChampionStats.tsx`
- **챔피언명 제거** (line 349-351): `<span>` 태그 삭제
- **테이블 셀 padding 축소** (모바일):
  - `<th>` 태그들: `px-4 py-3` → `px-1.5 py-2 md:px-4 md:py-3`
  - `<td>` 태그들: `px-4 py-3` → `px-1.5 py-2 md:px-4 md:py-3`
  - 챔피언 아이콘 셀의 `gap-2` → 아이콘만 남으므로 gap 불필요

## 검증
- `pnpm build` 로 빌드 에러 없는지 확인
- 브라우저에서 모바일 뷰포트로 챔피언 통계 탭 확인
