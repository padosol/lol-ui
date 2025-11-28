# LoL 전적 검색 서비스

League of Legends 전적 검색 서비스를 위한 Next.js 기반 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Management**: React Hook Form + Zod
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx   # 루트 레이아웃
│   └── page.tsx     # 홈 페이지
└── components/       # 재사용 가능한 컴포넌트
    ├── Header.tsx
    ├── Navigation.tsx
    ├── DesktopAppSection.tsx
    └── Footer.tsx
```

## 문서

자세한 문서는 [`docs/`](./docs/) 폴더를 참조하세요:

- [프로젝트 구조](./docs/project-structure.md)
- [라이브러리 및 의존성](./docs/libraries.md)
- [컴포넌트 작성 가이드](./docs/component-guide.md)
- [스타일링 가이드](./docs/styling-guide.md)
- [개발 가이드](./docs/development-guide.md)

## 주요 기능

- 🔍 소환사 전적 검색
- 📊 전적 데이터 시각화
- 🎮 게임 모드별 통계
- 📈 챔피언 통계 및 빌드

## 라이선스

이 프로젝트는 개인 프로젝트입니다.
