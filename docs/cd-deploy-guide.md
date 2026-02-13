# Deploy Repo CD 연동 가이드

## 1. 개요

`lol-ui` 리포지토리의 CI/CD 파이프라인은 다음과 같이 동작한다:

```
[main 브랜치 push]
       │
       ▼
  ┌──────────┐    workflow_run     ┌───────────────┐
  │  CI 워크플로우  │ ──(성공 시)──▶ │  Deploy 워크플로우  │
  │  (lint+build)  │               │  (lol-ui repo) │
  └──────────┘                     └───────┬───────┘
                                           │
                                   1. Docker 이미지 빌드
                                   2. ECR 푸시
                                   3. repository_dispatch
                                           │
                                           ▼
                                   ┌──────────────┐
                                   │  Deploy Repo  │
                                   │  CD 워크플로우   │
                                   └──────┬───────┘
                                          │
                                   이미지 풀 & 배포
```

- **CI** (`ci.yml`): `main` 브랜치 push 시 lint + build 수행
- **Deploy** (`deploy.yml`): CI 성공 후 Docker 이미지를 ECR에 푸시하고, deploy repo에 `repository_dispatch` 이벤트 전송
- **Deploy Repo CD**: 이벤트를 수신하여 실제 인프라에 배포

---

## 2. 수신 이벤트 스펙

### 이벤트 타입

| 항목 | 값 |
|------|-----|
| 이벤트 | `repository_dispatch` |
| event-type | `deploy` |

### 페이로드 필드

| 필드 | 설명 | 예시 |
|------|------|------|
| `image` | ECR 이미지 URI (태그 미포함, `registry/repository` 형식) | `123456789.dkr.ecr.ap-northeast-2.amazonaws.com/lol-ui` |
| `version` | `package.json`의 버전 | `1.4.0` |
| `sha` | 트리거된 커밋의 전체 SHA (40자) | `fd75c85a1b2c3d4e5f...` |
| `sha_short` | SHA 앞 7자리 | `fd75c85` |
| `tag` | `{version}-{sha_short}` 형식의 이미지 태그 | `1.4.0-fd75c85` |

### 페이로드 접근 방법

GitHub Actions 워크플로우에서 다음과 같이 접근한다:

```yaml
github.event.client_payload.image       # ECR 이미지 URI
github.event.client_payload.version     # 버전
github.event.client_payload.sha         # 전체 SHA
github.event.client_payload.sha_short   # 짧은 SHA
github.event.client_payload.tag         # 이미지 태그
```

전체 이미지 URI 조합:

```
${{ github.event.client_payload.image }}:${{ github.event.client_payload.tag }}
```

---

## 3. Docker 이미지 정보

### 빌드 스펙

| 항목 | 값 |
|------|-----|
| 베이스 이미지 | `node:20-alpine` |
| 빌드 방식 | 멀티 스테이지 (deps → builder → runner) |
| 출력 형식 | Next.js standalone |
| 실행 커맨드 | `node server.js` |
| 포트 | `3000` |
| 실행 유저 | `nextjs` (UID 1001, GID 1001) |

### 환경 변수

| 환경 변수 | 설정 시점 | 설명 |
|-----------|---------|------|
| `NODE_ENV` | 빌드 시 (`production`) | 변경 불필요 |
| `NEXT_PUBLIC_API_URL` | 빌드 시 ARG로 주입 | 클라이언트 사이드 API URL. **런타임 변경 불가** (빌드 시 번들에 포함됨) |
| `API_URL_INTERNAL` | 런타임 설정 가능 | 서버사이드 내부 API URL. 컨테이너 실행 시 `-e`로 주입 |
| `PORT` | 기본값 `3000` | 서버 리스닝 포트 |
| `HOSTNAME` | 기본값 `0.0.0.0` | 서버 바인딩 호스트 |

### 이미지 태그 체계

ECR에 푸시되는 태그는 두 가지:

```
{registry}/{repository}:{version}-{sha_short}   # 버전 태그 (예: 1.4.0-fd75c85)
{registry}/{repository}:latest                    # latest 태그
```

---

## 4. Deploy Repo 워크플로우 예시

```yaml
name: CD

on:
  repository_dispatch:
    types: [deploy]

jobs:
  deploy:
    name: Deploy lol-ui
    runs-on: ubuntu-latest

    permissions:
      id-token: write
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Print deployment info
        run: |
          echo "Deploying version: ${{ github.event.client_payload.version }}"
          echo "Image: ${{ github.event.client_payload.image }}:${{ github.event.client_payload.tag }}"
          echo "Commit: ${{ github.event.client_payload.sha_short }}"

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2

      # ── 배포 방식에 따라 아래 단계를 커스텀 ──

      # 예시 A: ECS 서비스 업데이트
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster ${{ vars.ECS_CLUSTER }} \
            --service ${{ vars.ECS_SERVICE }} \
            --force-new-deployment

      # 예시 B: docker compose (EC2 등)
      # - name: Deploy via SSH
      #   run: |
      #     ssh ${{ secrets.DEPLOY_HOST }} << 'EOF'
      #       docker pull ${{ github.event.client_payload.image }}:${{ github.event.client_payload.tag }}
      #       docker stop lol-ui || true
      #       docker run -d --name lol-ui --rm \
      #         -p 3000:3000 \
      #         -e API_URL_INTERNAL=http://backend:8100/api \
      #         ${{ github.event.client_payload.image }}:${{ github.event.client_payload.tag }}
      #     EOF
```

---

## 5. 필수 사전 설정

### lol-ui 리포지토리 (이미 설정됨)

| 항목 | 타입 | 설명 |
|------|------|------|
| `AWS_ROLE_ARN` | Secret | OIDC용 AWS IAM Role ARN (ECR push 권한) |
| `CD_REPO_TOKEN` | Secret | deploy repo에 `repository_dispatch` 이벤트를 보내기 위한 PAT |
| `AWS_REGION` | Variable | AWS 리전 |
| `ECR_REPOSITORY` | Variable | ECR 리포지토리 이름 |
| `CD_REPO` | Variable | deploy repo 경로 (`owner/repo` 형식) |
| `NEXT_PUBLIC_API_URL` | Variable | 클라이언트 API URL (빌드 시 주입) |

### Deploy 리포지토리 (설정 필요)

| 항목 | 타입 | 설명 |
|------|------|------|
| `AWS_ROLE_ARN` | Secret | OIDC용 AWS IAM Role ARN (**ECR pull 권한** 필요) |
| `AWS_REGION` | Variable | AWS 리전 (lol-ui와 동일) |
| 인프라별 설정 | Secret/Variable | ECS 클러스터명, 서비스명, SSH 키 등 배포 방식에 따라 추가 |

### CD_REPO_TOKEN 발급 조건

`CD_REPO_TOKEN`은 deploy repo에 `repository_dispatch` 이벤트를 전송하기 위한 GitHub Personal Access Token(PAT)이다:

- **타입**: Fine-grained PAT 권장
- **필요 권한**: deploy repo에 대한 `Contents: Read and write` (repository_dispatch 전송에 필요)
- **설정 위치**: lol-ui repo의 `Settings > Secrets and variables > Actions > Repository secrets`

### AWS IAM 권한 (Deploy Repo)

Deploy repo의 IAM Role에 최소한 다음 권한이 필요하다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    }
  ]
}
```

> `GetAuthorizationToken`은 리소스를 `*`로 설정해야 한다. 나머지는 특정 ECR 리포지토리 ARN으로 제한 가능.
