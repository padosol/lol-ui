# Plan: OAuth 작업 브랜치 생성

## Context
현재 `main` 브랜치에서 Google OAuth 로그인 방식 변경(프론트 → 백엔드 주도) 작업이 진행되었다. 작업 내용을 별도 feature 브랜치로 분리해야 한다.

## 실행 계획

1. `feat/oauth-backend-redirect` 브랜치를 현재 상태에서 생성 및 체크아웃
   ```bash
   git checkout -b feat/oauth-backend-redirect
   ```

이미 변경된 파일들이 working tree에 있으므로, 브랜치 생성 시 자동으로 함께 이동된다.
