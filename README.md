# 🚀 GBP Frontend

GBP 프로젝트의 프론트엔드 환경 설정 및 기술 스택 가이드입니다.

---

## 🛠 Tech Stack

### ⚡ Core & Build
| 영역 | 기술                | 사용 용도 |
|:----|:------------------|:---|
| **UI Rendering** | `React 19`        | 전체 UI 렌더링 및 컴포넌트 아키텍처 |
| **Language** | `TypeScript`      | 정적 타입 정의 및 런타임 안정성 확보 |
| **Build Tool** | `Vite (Rolldown)` | 초고속 개발 서버 및 최적화된 프로덕션 빌드 |
| **Routing** | `React Router`    | SPA 라우팅 및 중첩 레이아웃 구성 |

### 🎨 UI & Styling
| 영역 | 기술 | 사용 용도 |
|:----|:---|:---|
| **Styling** | `Tailwind CSS` | Utility-first 전역 스타일링 |
| **UI Kit** | `shadcn/ui` | 프로젝트 공통 UI 패턴 (Radix UI 기반) |
| **Utilities** | `cva`, `clsx`, `tw-merge` | Variant 기반 스타일 관리 및 클래스 병합 |
| **Animation** | `tailwindcss-animate` | 일관된 공통 애니메이션 효과 |
| **Icons** | `lucide-react` | 일관된 디자인의 SVG 아이콘 세트 |
| **Typography** | `Inter Variable` | 기본 타이포그래피 설정 |

### 🏗 State & Infrastructure
| 영역 | 기술 | 사용 용도                       |
|:----|:---|:----------------------------|
| **State** | `Zustand` | 전역 상태 관리                    |
| **Validation** | `Zod` | Schema 기반 Form 및 API 데이터 검증 |
| **Chart** | `Recharts` | 차트 라이브러리                    |
| **Linting** | `ESLint` | 코드 규칙 준수 및 정적 분석            |

---

## 🏃 Run & Build

### ✅ Requirements
- **Node.js**: `v24.x` 이상 (LTS 권장)
- **Package Manager**: `npm`

### ⚙️ Installation & Development

**1. 의존성 설치**
```bash
npm install
# npm install
```

**2. 개발 환경 실행**
```bash
npm run dev
# npm run dev
```

**3. 코드 품질 관리**
```bash
# Lint 검사 + fix 자동 적용
npm run lint
# npm run lint

# Lint 검사 후 리포트 생성
npm run lint:report
# npm run lint:report

```

**4. 프로덕션 빌드**
```bash
npm run build
# npm run build

npm run preview
# npm run preview
```
