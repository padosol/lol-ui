---
name: lol-patch-crawler
description: 리그 오브 레전드 패치노트를 크롤링하고, Claude가 HTML을 분석하여 JSON으로 변환합니다.
---

# LoL Patch Notes Crawler

리그 오브 레전드 공식 패치노트 페이지에서 HTML을 추출하고, Claude가 직접 분석하여 구조화된 JSON 데이터를 생성하는 스킬입니다.

## 워크플로우

```
URL → patch_crawler.py → HTML 저장 → Claude가 HTML 읽고 JSON 생성 → JSON 저장
```

## 사용 시나리오

- 사용자가 LoL 패치노트 URL을 제공하고 크롤링을 요청할 때
- 저장된 HTML 파일을 JSON으로 변환하고 싶을 때
- 패치노트 변경사항을 프로그래밍에 활용하고 싶을 때

## 사용법

### 1단계: HTML 크롤링

```bash
# 패치노트 URL에서 HTML 추출
python .claude/skills/lol-patch-crawler/scripts/patch_crawler.py \
  "https://www.leagueoflegends.com/ko-kr/news/game-updates/patch-26-1-notes/"

# 출력: docs/patch/26.1.html
```

### 2단계: JSON 생성 (Claude 수행)

사용자가 HTML 파일 경로를 제공하면:

```
/lol-patch-crawler docs/patch/26.1.html
```

Claude가 HTML을 읽고 직접 JSON을 생성하여 저장합니다.

## 의존성

```bash
pip install requests beautifulsoup4
```

---

# Claude JSON 생성 가이드

HTML 파일이 제공되면 아래 지침에 따라 JSON을 생성합니다.

## JSON 출력 스키마

```json
{
  "version": "26.1",
  "url": "https://www.leagueoflegends.com/ko-kr/news/game-updates/league-of-legends-patch-26-1-notes/",
  "date": "2026-01-08",
  "rift": {
    "champions": [
      {
        "targetName": "챔피언명",
        "type": "champion",
        "direction": "buff",
        "changes": [
          { "statName": "속성명", "before": "이전값", "after": "새값" }
        ]
      }
    ],
    "items": [
      {
        "targetName": "아이템명",
        "type": "item",
        "direction": "nerf",
        "changes": [
          { "statName": "속성명", "before": "이전값", "after": "새값" }
        ]
      }
    ],
    "systems": []
  },
  "arena": {
    "champions": [
      {
        "targetName": "챔피언명",
        "type": "champion",
        "direction": "adjust",
        "changes": [...]
      }
    ],
    "items": [
      {
        "targetName": "아이템명",
        "type": "item",
        "direction": "buff",
        "changes": [...]
      }
    ],
    "systems": [
      {
        "targetName": "귀빈명",
        "type": "prismatic",
        "direction": "buff",
        "changes": [...]
      }
    ]
  }
}
```

## 파싱 지침

### 1. 버전, URL, 날짜 추출

- 파일명에서 버전 추출: `26.1.html` → `"version": "26.1"`
- **url**: HTML 상단 주석 `<!-- url: ... -->`에서 추출. 없으면 사용자가 제공한 URL 사용
- **date**: HTML 상단 주석 `<!-- datetime: ... -->`에서 날짜 부분(YYYY-MM-DD)만 추출

### 2. 섹션 식별

| HTML 섹션 | JSON 경로 |
|-----------|-----------|
| `#patch-champions` | `rift.champions` |
| `#patch-new-items`, `#patch-returning-items`, `#patch-updated-items` | `rift.items` |
| `#patch-arena` 또는 "아레나" 텍스트 포함 섹션 | `arena.*` |
| "추가 패치 노트" 섹션 | 내용에 따라 rift 또는 arena로 분류 |

### 3. 변경사항 추출 패턴

변경사항은 주로 다음 형식으로 나타납니다:

```
속성명: 이전값 ⇒ 새값
속성명: 이전값 → 새값
속성명: 이전값 => 새값
```

- 구분자: `⇒`, `→`, `=>` 중 하나
- `<strong>` 태그 내 텍스트가 `statName`
- 콜론(`:`) 이후 구분자 앞까지가 `before`
- 구분자 이후가 `after`

### 4. 대상(targetName) 식별

- **챔피언**: `h3.change-title` 내 텍스트
- **아이템**: `h4.change-detail-title` 내 텍스트 (이미지 아이콘과 함께)
- **아레나 증강/귀빈/모루**: `<strong>` 태그 내 텍스트

### 5. 아레나 분류 규칙

| 키워드/패턴 | 분류 |
|-------------|------|
| "챔피언 (아레나)" | `arena.champions` |
| "아이템 (아레나)" | `arena.items` |
| "귀빈 (아레나)" | `arena.systems` (targetType: "prismatic") |
| "증강 (아레나)" | `arena.systems` (targetType: "augment") |
| "능력치 모루 (아레나)" | `arena.systems` (targetType: "anvil") |

### 6. 추가 패치 노트 분류

"추가 패치 노트" 섹션의 내용:

- `(아레나)` 키워드 포함 → `arena` 하위로 분류
- 그 외 → `rift` 하위로 분류 (대부분 챔피언)

### 7. type 필드 구조

모든 변경사항 항목에는 `type` 필드 포함:

| 배열 위치 | type 값 |
|-----------|---------|
| `rift.champions` | `"champion"` |
| `rift.items` | `"item"` |
| `rift.systems` | `"system"` |
| `arena.champions` | `"champion"` |
| `arena.items` | `"item"` |
| `arena.systems` | `"prismatic"`, `"augment"`, `"anvil"` |

`arena.systems` 예시:

```json
{
  "targetName": "귀빈명",
  "type": "prismatic",
  "changes": [...]
}
```

- `prismatic`: 귀빈
- `augment`: 증강
- `anvil`: 능력치 모루

### 8. direction 필드 (상향/하향/조정)

각 대상의 전반적인 변경 방향을 나타냅니다:

| 값 | 의미 |
|---|---|
| `"buff"` | 상향 (강화) |
| `"nerf"` | 하향 (약화) |
| `"adjust"` | 조정 (혼합 또는 판단 불가) |

**판단 기준:**
- 전체적으로 버프면 → `"buff"` (일부 nerf가 섞여도 전반적 강화면 buff)
- 전체적으로 너프면 → `"nerf"` (일부 buff가 섞여도 전반적 약화면 nerf)
- 거의 반반이거나 방향 판단 불가 → `"adjust"`

**개별 change 판단 로직:**

"높을수록 좋은" 속성 (숫자 증가 = 버프):
- 체력, 마나, 공격력, 방어력, 피해량, 회복량, 계수, 사거리 등

"낮을수록 좋은" 속성 (숫자 감소 = 버프):
- 재사용 대기시간(쿨다운), 마나 소모량, 낙하 시간 등

판단 불가 (adjust):
- 텍스트 변경 ("마법" → "물리")
- 시스템 재설계 (계수 공식 변경)
- 상충 변경 (기본 피해량↓ + 계수↑)

예시:

```json
{
  "targetName": "유나라",
  "type": "champion",
  "direction": "buff",
  "changes": [
    { "statName": "기본 체력", "before": "575", "after": "590" },
    { "statName": "공격력", "before": "53", "after": "55" }
  ]
}
```

## 실행 절차

1. **HTML 파일 읽기**: Read 도구로 HTML 파일 내용 확인
2. **구조 분석**: 위 지침에 따라 섹션별 변경사항 추출
3. **JSON 생성**: 스키마에 맞게 데이터 구조화
4. **파일 저장**: Write 도구로 `docs/patch/{버전}.json`에 저장

## 검증

생성된 JSON 확인:

```bash
# JSON 파일 존재 확인
ls docs/patch/26.1.json

# 내용 확인 (선택)
cat docs/patch/26.1.json | head -50
```

## 주의사항

- `rift.systems`는 현재 빈 배열로 유지 (향후 확장 가능)
- 변경사항이 없는 섹션은 빈 배열로 설정
- 모든 텍스트는 공백 정리 (trim)
- HTML 엔티티는 적절히 디코딩
