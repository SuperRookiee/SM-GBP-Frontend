# 🚀 Miracle Web

Miracle 프로젝트의 프론트엔드 환경 설정 및 기술 스택 가이드입니다.

---

## 🛠 Tech Stack

### ⚡ Core & Build

| 영역                  | 기술               | 사용 용도                              | 링크                                                       |
|:--------------------|:-----------------|:-----------------------------------|:---------------------------------------------------------|
| **UI Rendering**    | `React 19`       | 전체 UI 렌더링 및 컴포넌트 아키텍처              | [React](https://react.dev/)                              |
| **Language**        | `TypeScript`     | 정적 타입 정의 및 런타임 안정성 확보              | [TypeScript](https://www.typescriptlang.org/)            |
| **Build Tool**      | `Vite`           | 초고속 개발 서버 및 최적화된 프로덕션 빌드           | [Vite](https://vite.dev/)                                |
| **Bundler**         | `Rolldown`       | Vite 차세대 번들러                       | [Rolldown](https://rolldown.rs/)                         |
| **Package Manager** | `pnpm`           | 빠른 의존성 설치, 디스크 절약, 일관된 lockfile 관리 | [pnpm](https://pnpm.io/)                                 |
| **Performance**     | `React Compiler` | 자동 메모이제이션으로 불필요한 리렌더 방지            | [React Compiler](https://react.dev/learn/react-compiler) |
| **Routing**         | `React Router`   | SPA 라우팅 및 중첩 레이아웃 구성               | [React Router](https://reactrouter.com/)                 |

### 🎨 UI & Styling

| 영역             | 기술                        | 사용 용도                      | 링크                                   |
|:---------------|:--------------------------|:---------------------------|:-------------------------------------|
| **Styling**    | `Tailwind CSS`            | Utility-first 전역 스타일링      | [Tailwind](https://tailwindcss.com/) |
| **UI Kit**     | `shadcn/ui`               | 프로젝트 공통 UI 패턴              | [shadcn/ui](https://ui.shadcn.com/)  |
| **Utilities**  | `cva`, `clsx`, `tw-merge` | Variant 기반 스타일 관리 및 클래스 병합 |
| **Icons**      | `lucide-react`            | 일관된 SVG 아이콘 세트             | [lucide](https://lucide.dev/)        |
| **Typography** | `Inter Variable`          | 기본 타이포그래피                  | [Inter](https://rsms.me/inter/)      |

### 🏗 State & Infrastructure

| 영역             | 기술         | 사용 용도            | 링크                                                 |
|:---------------|:-----------|:-----------------|:---------------------------------------------------|
| **State**      | `Zustand`  | 전역 상태 관리         | [Zustand](https://zustand.docs.pmnd.rs/)           |
| **Validation** | `Zod`      | Schema 기반 데이터 검증 | [Zod](https://zod.dev/)                            |
| **Linting**    | `ESLint`   | 정적 코드 분석         | [ESLint](https://eslint.org/)                      |
| **Chart**      | `Recharts` | 차트 라이브러리         | [Recharts](https://recharts.org/)                  |
| **Grid**       | `Toast UI` | 테이블 라이브러리        | [Toast UI](https://nhn.github.io/tui.grid/latest/) |

### 🔌 Data Fetching

| 영역               | 기술               | 사용 용도              | 링크                                                  |
|:-----------------|:-----------------|:-------------------|:----------------------------------------------------|
| **HTTP Client**  | `Axios`          | API 통신 및 인터셉터      | [Axios](https://axios-http.com/)                    |
| **Server State** | `TanStack Query` | 서버 상태 캐싱 및 refetch | [TanStack Query](https://tanstack.com/query/latest) |

### ⚙️ Dev Tools

| 영역                         | 기술                        | 사용 용도           | 링크                                                                                |
|:---------------------------|:--------------------------|:----------------|:----------------------------------------------------------------------------------|
| **Testing**                | `Vitest`                  | 단위 테스트 및 통합 테스트 | [Vitest](https://vitest.dev/)                                                     |
| **State Debugging**        | `Redux DevTools`          | Zustand 변화 추적   | [Redux DevTools](https://github.com/reduxjs/redux-devtools)                       |
| **Server State Debugging** | `TanStack Query DevTools` | Query 캐시 시각화    | [Query DevTools](https://tanstack.com/query/latest/docs/framework/react/devtools) |

---

## 🏃 Run & Build

### ✅ Requirements

- **Node.js**: `v24.x` 이상 (LTS 권장)
- **Package Manager**: `pnpm`

### ⚙️ Installation & Development

**1. 의존성 설치**

```bash
pnpm install
# pnpm install
```

**2. 개발 환경 실행**

```bash
pnpm run dev
# pnpm run dev
```

**3. 코드 품질 관리**

```bash
# Lint 검사 + fix 자동 적용
pnpm run lint
# pnpm run lint

# Lint 검사 후 리포트 생성
pnpm run lint:report
# pnpm run lint:report

```

**4. 프로덕션 빌드**

```bash
pnpm run build
# pnpm run build

pnpm run preview
# pnpm run preview
```
