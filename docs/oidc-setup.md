# GitHub Actions OIDC → AWS 연동 설정 가이드

`deploy.yml` 워크플로우가 정상 동작하기 위한 AWS 및 GitHub 설정 체크리스트.

> **OIDC(OpenID Connect)란?**
> GitHub Actions가 AWS에 접근할 때 장기 액세스 키(Access Key) 대신 **임시 토큰**을 발급받아 사용하는 인증 방식입니다.
> 액세스 키를 직접 저장하지 않으므로 키 유출 위험이 없고, 토큰이 자동 만료되어 보안성이 높습니다.

---

## 1. AWS OIDC Identity Provider (자격 증명 공급자) 생성

> GitHub Actions가 발급한 토큰을 AWS가 신뢰할 수 있도록 **OIDC 공급자**를 등록하는 단계입니다.
> 이 설정이 없으면 GitHub Actions에서 AWS 리소스에 접근할 수 없습니다.

### 콘솔 진입 경로

1. [AWS 콘솔](https://console.aws.amazon.com/) 로그인
2. 상단 검색창에 **IAM** 입력 → **IAM** 서비스 클릭
3. 좌측 사이드바에서 **자격 증명 공급자(Identity providers)** 클릭
4. 우측 상단 **공급자 추가(Add provider)** 버튼 클릭

### 설정 항목

- [ ] 공급자 유형(Provider type): **OpenID Connect** 선택
- [ ] 공급자 URL(Provider URL): `https://token.actions.githubusercontent.com` 입력
- [ ] **지문 가져오기(Get thumbprint)** 버튼 클릭 — URL의 SSL 인증서 지문을 자동으로 가져옵니다
- [ ] 대상(Audience): `sts.amazonaws.com` 입력
- [ ] **공급자 추가(Add provider)** 클릭하여 생성 완료

## 2. IAM Role (역할) 생성

> GitHub Actions가 AWS 리소스에 접근할 때 사용할 **역할(Role)**을 만듭니다.
> 역할에는 두 가지 정책이 필요합니다:
> - **Trust Policy (신뢰 정책)**: "누가 이 역할을 사용할 수 있는가" — GitHub Actions만 허용
> - **Permission Policy (권한 정책)**: "이 역할로 무엇을 할 수 있는가" — ECR 이미지 푸시만 허용

### 콘솔 진입 경로

1. IAM 콘솔 좌측 사이드바에서 **역할(Roles)** 클릭
2. 우측 상단 **역할 생성(Create role)** 버튼 클릭

### Trust Policy (신뢰 정책)

- [ ] 신뢰할 수 있는 엔터티 유형(Trusted entity type): **웹 자격 증명(Web identity)** 선택
- [ ] 자격 증명 공급자(Identity provider): `token.actions.githubusercontent.com` 선택
- [ ] 대상(Audience): `sts.amazonaws.com` 선택
- [ ] 역할 이름을 지정하고 생성 완료 (예: `github-actions-deploy`)
- [ ] 생성 후 해당 역할 클릭 → **신뢰 관계(Trust relationships)** 탭 → **신뢰 정책 편집(Edit trust policy)** 클릭하여 아래 JSON으로 수정:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<GITHUB_ORG>/<GITHUB_REPO>:*"
        }
      }
    }
  ]
}
```

- [ ] `<ACCOUNT_ID>`를 실제 AWS 계정 ID로 교체 (12자리 숫자, AWS 콘솔 우측 상단 계정 메뉴에서 확인 가능)
- [ ] `<GITHUB_ORG>/<GITHUB_REPO>`를 실제 리포지토리 경로로 교체:
  - `<GITHUB_ORG>`: GitHub **사용자명(username)** 또는 **조직명(organization)** — 리포지토리 URL `github.com/{여기}/{repo}` 의 첫 번째 부분
  - `<GITHUB_REPO>`: **리포지토리 이름** — URL `github.com/{org}/{여기}` 의 두 번째 부분
  - 예: 리포지토리 URL이 `github.com/padosol/lol-ui`이면 → `repo:padosol/lol-ui:*`

### Permission Policy (권한 정책)

- [ ] 역할 상세 페이지 → **권한(Permissions)** 탭 → **권한 추가(Add permissions)** → **인라인 정책 생성(Create inline policy)** 클릭

아래 두 가지 방법 중 하나를 선택하세요:

#### 방법 A: 비주얼 에디터 (Visual Editor)

1. 서비스(Service) 검색창에 **ECR** 입력 → **Elastic Container Registry** 선택
2. 액션(Actions) 섹션:
   - **Read** 펼치기 → `BatchCheckLayerAvailability`, `BatchGetImage`, `GetAuthorizationToken`, `GetDownloadUrlForLayer` 체크
   - **Write** 펼치기 → `CompleteLayerUpload`, `InitiateLayerUpload`, `PutImage`, `UploadLayerPart` 체크
3. 리소스(Resources) 섹션:
   - `GetAuthorizationToken`은 리소스 제한 없이 **모든 리소스(All resources)** 허용
   - 나머지 액션은 **특정 리소스(Specific)** 선택 → **ARN 추가(Add ARN)** 클릭 → 리전, 계정 ID, 리포지토리 이름 입력

#### 방법 B: JSON 편집기

- [ ] **JSON** 탭을 선택하고 아래 내용을 붙여넣기:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:<REGION>:<ACCOUNT_ID>:repository/<ECR_REPO_NAME>"
    }
  ]
}
```

- [ ] `<REGION>`, `<ACCOUNT_ID>`, `<ECR_REPO_NAME>`을 실제 값으로 교체
- [ ] 정책 이름 지정 후 **정책 생성(Create policy)** 클릭
- [ ] 생성된 Role ARN 기록 (예: `arn:aws:iam::123456789012:role/github-actions-deploy`)

## 3. ECR Repository (컨테이너 이미지 저장소) 생성

> Docker 이미지를 저장할 **ECR 리포지토리**를 만듭니다.
> GitHub Actions가 빌드한 이미지를 이 저장소에 푸시하고, 배포 시 이 이미지를 가져와 실행합니다.

### 콘솔 진입 경로

1. [AWS 콘솔](https://console.aws.amazon.com/) 상단 검색창에 **ECR** 또는 **Elastic Container Registry** 입력
2. **Amazon Elastic Container Registry** 서비스 클릭
3. 좌측 사이드바에서 **프라이빗 레지스트리(Private registry)** → **리포지토리(Repositories)** 클릭
4. 우측 상단 **리포지토리 생성(Create repository)** 버튼 클릭

### 설정 항목

- [ ] 표시 유형(Visibility): **Private** 선택
- [ ] 리포지토리 이름(Repository name) 설정 — 워크플로우의 `ECR_REPOSITORY` 변수와 **동일한 이름**이어야 합니다
- [ ] 이미지 태그 변경 가능성(Image tag mutability): **Mutable** 선택 (`:latest` 태그 덮어쓰기 허용)
- [ ] **리포지토리 생성(Create repository)** 클릭하여 생성 완료

## 4. GitHub Secrets & Variables 등록

> 워크플로우에서 사용하는 민감 정보와 설정값을 GitHub에 등록합니다.
> - **Secrets**: 암호화되어 저장되며, 로그에 마스킹 처리됩니다. **노출되면 안 되는 값** (Role ARN, 토큰 등)에 사용합니다.
> - **Variables**: 평문으로 저장되며, 로그에 그대로 노출됩니다. **공개되어도 무방한 설정값** (리전, 리포지토리 이름 등)에 사용합니다.

### 콘솔 진입 경로

1. GitHub 리포지토리 페이지 → 상단 탭에서 **Settings** 클릭
2. 좌측 사이드바에서 **Secrets and variables** 클릭 → **Actions** 선택
3. **Secrets** 탭 또는 **Variables** 탭에서 각각 등록

### Secrets

- [ ] `AWS_ROLE_ARN` — 2단계에서 생성한 IAM Role ARN
- [ ] `CD_REPO_TOKEN` — CD 리포지토리에 `repository_dispatch` 이벤트를 보낼 수 있는 Personal Access Token (repo 권한 필요)

### Variables

- [ ] `AWS_REGION` — AWS 리전 (예: `ap-northeast-2`)
- [ ] `ECR_REPOSITORY` — ECR 리포지토리 이름
- [ ] `NEXT_PUBLIC_API_URL` — 프로덕션 API URL
- [ ] `CD_REPO` — CD 리포지토리 경로 (예: `padosol/lol-cd`)

## 5. GitHub Actions Workflow 확인

- [ ] `.github/workflows/deploy.yml` 파일 존재 확인
- [ ] `permissions`에 `id-token: write`가 설정되어 있는지 확인
- [ ] CI 워크플로우가 `main` 브랜치에서 성공적으로 완료되는지 확인

## 6. 검증

- [ ] `main` 브랜치에 push 후 CI 워크플로우 성공 확인
- [ ] Deploy 워크플로우가 자동 트리거되는지 확인
- [ ] "Configure AWS credentials (OIDC)" 단계 성공 확인
- [ ] "Login to Amazon ECR" 단계 성공 확인
- [ ] "Build and push Docker image" 단계 성공 확인
- [ ] ECR 콘솔에서 이미지 태그 확인 (`latest`, 버전, SHA)
- [ ] "Trigger CD deployment" 단계 성공 확인
