# 패치 26.6 크롤링 계획

## Context
사용자가 `/lol-patch-crawler` 스킬로 26.6 패치노트 크롤링을 요청함.
URL: https://www.leagueoflegends.com/ko-kr/news/game-updates/league-of-legends-patch-26-6-notes/

## 실행 단계

### 1. HTML 크롤링
```bash
python .claude/skills/lol-patch-crawler/scripts/patch_crawler.py \
  "https://www.leagueoflegends.com/ko-kr/news/game-updates/league-of-legends-patch-26-6-notes/"
```
- 출력: `docs/patch/26.6.html`

### 2. HTML 분석 및 JSON 생성
- `docs/patch/26.6.html` 읽기
- 스킬 가이드에 따라 챔피언/아이템/시스템 변경사항 파싱
- JSON 스키마에 맞게 구조화

### 3. JSON 저장
- `docs/patch/26.6.json`에 저장

## 참고 파일
- 크롤러: `.claude/skills/lol-patch-crawler/scripts/patch_crawler.py`
- 기존 JSON 참고: `docs/patch/26.5.json`
