# 이미지 URL 유틸리티 가이드

이 문서는 프로젝트에서 사용하는 모든 이미지 URL 생성 유틸리티 함수에 대한 가이드입니다.

## 기본 URL

모든 이미지는 다음 기본 URL을 사용합니다:
```
https://static.mmrtr.shop/{category}/{identifier}.png
```

## 이미지 카테고리

### 1. 챔피언 (Champion)

**경로**: `champion/`  
**파일**: `src/utils/champion.ts`

```typescript
import { getChampionImageUrl } from "@/utils/champion";

// 사용 예시
const url = getChampionImageUrl("Aatrox");
// 결과: https://static.mmrtr.shop/champion/Aatrox.png
```

**함수**:
- `getChampionImageUrl(championName: string): string`
  - 챔피언 이름으로 이미지 URL 생성
  - 파라미터: 챔피언 이름 (예: "Aatrox", "Ahri")
  - 반환: 이미지 URL 또는 빈 문자열

---

### 2. 아이템 (Items)

**경로**: `items/`  
**파일**: `src/utils/game.ts`

```typescript
import { getItemImageUrl } from "@/utils/game";

// 사용 예시
const url = getItemImageUrl(1001);
// 결과: https://static.mmrtr.shop/items/1001.png
```

**함수**:
- `getItemImageUrl(itemId: number): string`
  - 아이템 ID로 이미지 URL 생성
  - 파라미터: 아이템 ID (0이면 빈 슬롯, 빈 문자열 반환)
  - 반환: 이미지 URL 또는 빈 문자열

**추가 유틸리티**:
- `extractItemIds(item: any): number[]`
  - 아이템 객체나 배열에서 아이템 ID 배열 추출
  - 최대 7개 슬롯 반환 (0-6)

---

### 3. 소환사 주문 (Spells)

**경로**: `spells/`  
**파일**: `src/utils/game.ts`

```typescript
import { getSpellImageUrl } from "@/utils/game";

// 사용 예시
const url = getSpellImageUrl(4);
// 결과: https://static.mmrtr.shop/spells/4.png
```

**함수**:
- `getSpellImageUrl(spellId: number): string`
  - 소환사 주문 ID로 이미지 URL 생성
  - 파라미터: 소환사 주문 ID (0이면 빈 문자열 반환)
  - 반환: 이미지 URL 또는 빈 문자열

---

### 4. 룬 (Perks)

**경로**: `perks/`  
**파일**: `src/utils/game.ts`

```typescript
import { getPerkImageUrl } from "@/utils/game";

// 사용 예시
const url = getPerkImageUrl(8000);
// 결과: https://static.mmrtr.shop/perks/8000.png
```

**함수**:
- `getPerkImageUrl(perkId: number): string`
  - 룬 ID로 이미지 URL 생성
  - 파라미터: 룬 ID (0이면 빈 문자열 반환)
  - 반환: 이미지 URL 또는 빈 문자열

**참고**: `getRuneImageUrl()` 함수도 사용 가능하지만, `getPerkImageUrl()` 사용을 권장합니다.

---

### 5. 프로필 아이콘 (Profile)

**경로**: `profile/`  
**파일**: `src/utils/profile.ts`

```typescript
import { getProfileIconImageUrl } from "@/utils/profile";

// 사용 예시
const url = getProfileIconImageUrl(1);
// 결과: https://static.mmrtr.shop/profile/1.png
```

**함수**:
- `getProfileIconImageUrl(profileIconId: number): string`
  - 프로필 아이콘 ID로 이미지 URL 생성
  - 파라미터: 프로필 아이콘 ID (0이면 빈 문자열 반환)
  - 반환: 이미지 URL 또는 빈 문자열

---

### 6. 포지션 (Position)

**경로**: `position/`  
**파일**: `src/utils/position.ts`

```typescript
import { getPositionImageUrl, getPositionName } from "@/utils/position";

// 사용 예시
const url = getPositionImageUrl("TOP");
// 결과: https://static.mmrtr.shop/position/TOP.png

const name = getPositionName("TOP");
// 결과: "탑"
```

**함수**:
- `getPositionImageUrl(position: string): string`
  - 포지션 이름으로 이미지 URL 생성
  - 파라미터: 포지션 이름 (예: "TOP", "JUNGLE", "MID", "ADC", "SUPPORT")
  - 반환: 이미지 URL 또는 빈 문자열

- `getPositionName(position: string): string`
  - 포지션 이름을 한글로 변환
  - 파라미터: 포지션 이름
  - 반환: 한글 포지션 이름

---

### 7. 티어 (Tier)

**경로**: `tier/`  
**파일**: `src/utils/tier.ts`

```typescript
import { 
  getTierImageUrl, 
  getTierName, 
  getTierInitial, 
  getTierColor 
} from "@/utils/tier";

// 사용 예시
const url = getTierImageUrl("DIAMOND");
// 결과: https://static.mmrtr.shop/tier/DIAMOND.png

const name = getTierName("DIAMOND");
// 결과: "다이아몬드"

const initial = getTierInitial("DIAMOND");
// 결과: "D"

const color = getTierColor("DIAMOND");
// 결과: "from-blue-400 to-blue-600"
```

**함수**:
- `getTierImageUrl(tier: string): string`
  - 티어 이름으로 이미지 URL 생성
  - 파라미터: 티어 이름 (예: "IRON", "BRONZE", "DIAMOND", "CHALLENGER")
  - 반환: 이미지 URL 또는 빈 문자열

- `getTierName(tier: string): string`
  - 티어 이름을 한글로 변환

- `getTierInitial(tier: string): string`
  - 티어 이름의 이니셜 반환

- `getTierColor(tier: string): string`
  - 티어에 따른 Tailwind CSS 그라데이션 클래스 반환

---

### 8. 스타일 (Styles)

**경로**: `styles/`  
**파일**: `src/utils/styles.ts`

```typescript
import { getStyleImageUrl } from "@/utils/styles";

// 사용 예시
const url = getStyleImageUrl(8000);
// 결과: https://static.mmrtr.shop/styles/8000.png
```

**함수**:
- `getStyleImageUrl(styleId: number): string`
  - 스타일 ID로 이미지 URL 생성
  - 파라미터: 스타일 ID (0이면 빈 문자열 반환)
  - 반환: 이미지 URL 또는 빈 문자열

---

## 사용 예시

### 컴포넌트에서 사용하기

```typescript
"use client";

import { getChampionImageUrl } from "@/utils/champion";
import { getItemImageUrl } from "@/utils/game";
import { getProfileIconImageUrl } from "@/utils/profile";

export default function MatchCard({ match }) {
  return (
    <div>
      {/* 챔피언 이미지 */}
      <img 
        src={getChampionImageUrl(match.championName)} 
        alt={match.championName}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      
      {/* 프로필 아이콘 */}
      <img 
        src={getProfileIconImageUrl(match.profileIconId)} 
        alt="Profile"
      />
      
      {/* 아이템 이미지 */}
      {match.items.map((itemId, index) => (
        <img 
          key={index}
          src={getItemImageUrl(itemId)} 
          alt={`Item ${itemId}`}
        />
      ))}
    </div>
  );
}
```

### 이미지 로드 실패 처리

모든 이미지 URL 함수는 유효하지 않은 입력에 대해 빈 문자열을 반환합니다. 이미지 로드 실패 시 `onError` 핸들러를 사용하여 처리하세요:

```typescript
<img
  src={getChampionImageUrl(championName)}
  alt={championName}
  onError={(e) => {
    // 이미지 로드 실패 시 처리
    e.currentTarget.style.display = "none";
    // 또는 기본 이미지로 대체
    e.currentTarget.src = "/default-champion.png";
  }}
/>
```

---

## 파일 구조

```
src/utils/
├── champion.ts    # 챔피언 이미지 URL
├── game.ts        # 아이템, 스펠, 룬 이미지 URL
├── profile.ts     # 프로필 아이콘 이미지 URL
├── position.ts    # 포지션 이미지 URL
├── tier.ts        # 티어 이미지 URL
└── styles.ts      # 스타일 이미지 URL
```

---

## 주의사항

1. **이미지 형식**: 모든 이미지는 PNG 형식입니다.
2. **대소문자**: 챔피언 이름과 포지션, 티어는 대소문자를 구분합니다. 함수 내부에서 자동으로 변환됩니다.
3. **유효성 검사**: 모든 함수는 유효하지 않은 입력에 대해 빈 문자열을 반환합니다.
4. **에러 처리**: 이미지 로드 실패 시 `onError` 핸들러를 사용하여 처리하세요.

---

## 업데이트 이력

- 2024-12-XX: 초기 문서 작성
  - 챔피언, 아이템, 스펠, 룬, 프로필, 포지션, 티어, 스타일 이미지 URL 유틸리티 추가

