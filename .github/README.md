# GitHub Workflows

프로젝트에 정의된 GitHub Actions 워크플로우 목록과 각 역할을 설명한다.

## 요약

| 워크플로우 | 파일 | 트리거 |
|------------|------|--------|
| [CI](#ci) | `ci.yml` | PR / push (main) |
| [Deploy](#deploy) | `deploy.yml` | CI 워크플로우 성공 시 (main) |
| [CodeQL](#codeql) | `codeql.yml` | PR / push (main) / 매주 일요일 |
| [Dependency Review](#dependency-review) | `dependency-review.yml` | PR (main) |
| [Lighthouse CI](#lighthouse-ci) | `lighthouse.yml` | PR (main) |
| [Claude Code Review](#claude-code-review) | `claude-code-review.yml` | PR (opened, synchronize, ready_for_review, reopened) |
| [Claude Code](#claude-code) | `claude.yml` | Issue/PR 코멘트에서 `@claude` 멘션 시 |
| [Release Please](#release-please) | `release-please.yml` | push (main) |

---

## CI

**파일:** `.github/workflows/ci.yml`

**트리거:** `main` 브랜치 대상 PR 또는 push

**주요 단계:**

1. **Lint** — `pnpm lint`로 코드 스타일 검사
2. **Build** — `pnpm build`로 빌드 성공 여부 검증

두 Job은 독립적으로 병렬 실행된다. Node 20 + pnpm 환경에서 `--frozen-lockfile`로 의존성을 설치한다.

---

## Deploy

**파일:** `.github/workflows/deploy.yml`

**트리거:** CI 워크플로우가 `main` 브랜치에서 성공 완료된 후 (`workflow_run`)

**주요 단계:**

1. `package.json`에서 버전, 커밋 SHA에서 short hash 추출
2. AWS OIDC로 인증 후 Amazon ECR 로그인
3. Docker Buildx로 이미지 빌드 & ECR 푸시 (태그: `{version}-{sha_short}`, `latest`)
4. `repository-dispatch`로 CD 리포지토리에 배포 이벤트 트리거

GitHub Actions 캐시(`type=gha`)를 활용하여 Docker 빌드 속도를 최적화한다.

---

## CodeQL

**파일:** `.github/workflows/codeql.yml`

**트리거:** `main` 브랜치 대상 PR / push, 매주 일요일 00:00 UTC (스케줄)

**주요 단계:**

1. CodeQL 초기화 (`javascript-typescript`, `security-and-quality` 쿼리)
2. Autobuild
3. 정적 분석 수행

보안 취약점과 코드 품질 문제를 자동으로 탐지한다. 결과는 GitHub Security 탭에서 확인할 수 있다.

---

## Dependency Review

**파일:** `.github/workflows/dependency-review.yml`

**트리거:** `main` 브랜치 대상 PR

**주요 단계:**

1. `actions/dependency-review-action`으로 변경된 의존성 검토
2. `high` 이상 심각도의 취약점 발견 시 실패 처리
3. PR에 검토 결과 코멘트 자동 작성

---

## Lighthouse CI

**파일:** `.github/workflows/lighthouse.yml`

**트리거:** `main` 브랜치 대상 PR

**주요 단계:**

1. 의존성 설치 및 프로젝트 빌드
2. `treosh/lighthouse-ci-action`으로 Lighthouse 성능 측정
3. 결과 아티팩트 업로드 및 임시 퍼블릭 스토리지에 리포트 저장

설정 파일: `lighthouserc.json`

---

## Claude Code Review

**파일:** `.github/workflows/claude-code-review.yml`

**트리거:** PR 이벤트 (opened, synchronize, ready_for_review, reopened)

**주요 단계:**

1. `anthropics/claude-code-action`을 사용하여 Claude AI 코드 리뷰 실행
2. `code-review` 플러그인으로 PR 변경 사항 분석

---

## Claude Code

**파일:** `.github/workflows/claude.yml`

**트리거:** Issue 또는 PR 코멘트/리뷰에서 `@claude` 멘션 시

**대상 이벤트:**

- `issue_comment` (created)
- `pull_request_review_comment` (created)
- `pull_request_review` (submitted)
- `issues` (opened, assigned)

`@claude`가 포함된 코멘트에만 반응하여 Claude AI가 요청된 작업을 수행한다. CI 결과 읽기 권한(`actions: read`)이 추가로 부여된다.

---

## Release Please

**파일:** `.github/workflows/release-please.yml`

**트리거:** `main` 브랜치에 push

**주요 단계:**

1. `googleapis/release-please-action`으로 Conventional Commits 기반 릴리즈 PR 자동 생성
2. 릴리즈 PR 병합 시 버전 태그 및 GitHub Release 자동 생성

릴리즈 타입: `node` (package.json 버전 관리)
