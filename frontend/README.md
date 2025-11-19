# 아그작 Web Frontend

운세 검사 및 강화 서비스 **아그작(agzak)** 의 웹 프론트엔드 레포지토리입니다.
React + TypeScript + Vite 기반의 PWA로, 운세 조회 · 운세 강화 미니게임 · 포춘쿠키 인벤토리 · 포춘쿠키 도감 · 운세 랭킹 · 쿠키 선물 기능 · 운세 통계/달력 화면을 제공합니다.

## Tech Stack

**Core**
- React 18, TypeScript, Vite
**Routing**
- React Router
**State Management**
- Zustand
**UI**
- Tailwind CSS, shadcn/ui, custom pixel fonts (DNF, Galmuri 계열)
**API / Networking**
- Axios 커스텀 인스턴스 (src/lib/axios.ts)
- 도메인별 API 레이어 (src/lib/*.ts)
**Analytics / QA**
- Google Analytics 4, Hotjar
**PWA**
- manifest + service worker 지원

## Directory Structure

```bash
agzak/
├── public/                      # 정적 리소스
├── dist/                        # 빌드 결과물
├── dev-dist/                    # Vite 개발 빌드 캐시
├── src/
│   ├── adapters/                # API → FE 모델 변환 계층
│   │     └── fortuneAdapter.ts
│   │     └── ... 
│   ├── app/                     # Router, App Shell
│   ├── assets/                  # 이미지, 폰트, 아이콘 등
│   ├── components/              # atoms/molecules/organisms UI
│   │     └── atoms/
│   │     └── molecules/
│   │     └── organisms/
│   ├── constants/               # 상수 테이블
│   ├── data/                    # 초기 데이터, mock 등
│   ├── hooks/                   # 커스텀 훅
│   ├── lib/                     # API · axios · 유틸 레이어
│   │     ├── axios.ts           # axios instance & interceptors
│   │     ├── api.ts
│   │     ├── mainAPI.ts
│   │     ├── fortuneAPI.ts
│   │     ├── cookiesAPI.ts
│   │     ├── gameAPI.ts
│   │     ├── rankingAPI.ts
│   │     ├── shareAPI.ts
│   │     └── utils.ts
│   ├── pages/                   # 라우팅 페이지
│   │     ├── Home/
│   │     ├── Fortune/
│   │     ├── Enforce/           # 오븐 강화 게임
│   │     ├── Cookies/           # 인벤토리
│   │     ├── Calendar/          # 운세 달력
│   │     ├── Ranking/
│   │     ├── My/                # 마이페이지
│   │     ├── Auth/              # 로그인 · 콜백
│   │     └── _shared/           # 공통 레이아웃/컴포넌트
│   ├── pwa/                     # PWA 구성요소
│   │     ├── registerSW.ts
│   │     └── sw.ts
│   ├── store/                   # Zustand 상태 계층
│   │     ├── useFortuneStore.ts
│   │     ├── useEnforceStore.ts
│   │     ├── useCookiesStore.ts
│   │     ├── useRankingStore.ts
│   │     ├── useAuthStore.ts
│   │     ├── useHomeStore.ts
│   │     ├── sessionQuotaStore.ts
│   │     └── ...
│   ├── styles/                  # 전역 스타일, 폰트 선언
│   ├── types/                   # 타입 정의
│   ├── env.d.ts
│   └── main.tsx
│
├── index.html
├── Dockerfile                   # FE 빌드 및 배포용
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## API / Data Flow

아그작 프론트엔드는 명확한 레이어 구조로 구성됩니다.
```bash
📡 API 요청  
   → axios instance (baseURL, interceptors)  
   → domain API (fortuneAPI.ts 등)  
   → adapter (원시 데이터 → FE 모델 변환)  
   → Zustand stores (도메인 단위 상태 관리)  
   → UI Components (pages / components)
```

## Routing Structure

```bash
/
├── /fortune
├── /enforce
├── /cookies
├── /calendar
├── /ranking
├── /my
└── /auth/callback
```

## Environment Variables

프로젝트 루트에 .env을 생성하고 다음 항목을 설정합니다.

```bash
VITE_API_BASE_URL
VITE_KAKAO_LOGIN_JS_KEY
```

## How to Run

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Code Convention

- 컴포넌트는 PascalCase
- hooks는 useXxx
- Zustand 스토어는 useXxxStore
- API 파일은 xxxAPI.ts
- Atomic 컴포넌트 → Domain components → Page 구성 규칙 유지

## Analytics / QA

- GA4: 페이지뷰, 오븐 게임 결과, 쿠키 사용 등 주요 이벤트 트래킹
- Hotjar: Funnel 분석, UI 히트맵, 실제 유즈 플로우 수집
- 서버 에러 로깅