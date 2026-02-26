# Code Convention

## 1. React 기본 규칙

- 함수형 컴포넌트만 사용
- `arrow function`만 사용
- 컴포넌트는 `export default`만 사용
- 한 파일에는 하나의 컴포넌트만 정의
- 컴포넌트 이름 및 컴포넌트 폴더명은 **PascalCase**를 사용

```tsx
const SampleComponent = () => {
  return <div/>;
};

export default SampleComponent;
```

---

## 2. 네이밍 규칙

### 2.1 변수 / 함수명

- 변수 및 함수명은 `camelCase`를 사용
- 함수명은 **동사 + 명사** 형태로 작성

### 2.2 CSS / className

- CSS 클래스명 및 `className`에는 `snake_case` 또는 `kebab-case` 사용을 허용
- 하나의 프로젝트 내에서는 **한 가지 표기법으로 통일**하는 것을 권장

---

### 2.2 boolean (flag) 변수 네이밍

- flag 변수(`boolean` 타입)의 경우, **기본적으로 `is` prefix를 사용**
- **특수한 경우에 한해 `has` prefix를 허용**

```tsx
isLoading;      // 상태 여부
isDisabled;

hasPermission;  // 소유/포함 여부
hasToken;
```

---

### 2.3 약어 사용 규칙

- 약어 사용은 기본적으로 **금지**
- 단, **관용적으로 널리 사용되는 약어**와 **팀 합의된 약어**만 허용
- camelCase 및 PascalCase에서는 `URL`, `HTML` 같은 범용적인 대문자 약어는 **대문자 그대로** 사용

비권장 예시

```tsx
idx;           // ❌
arr;           // ❌
string2Number; // ❌
```

권장 예시

```tsx
index;           // ⭕
array;           // ⭕
stringToNumber;  // ⭕
```

> 새로운 약어가 필요할 경우 팀 합의를 통해 추가
>

---

### 2.4 상수 네이밍

- 상수는 `UPPER_CASE`로 정의
- 상수 객체의 하위 변수명은 `camelCase`를 사용

```tsx
const MESSAGE = {
  errorMessage: '에러 메시지입니다.',
  successMessage: '성공 메시지입니다.',
};

console.log(MESSAGE.errorMessage);
```

---

### 2.5 API 호출 함수 네이밍

- API 호출 함수명은 반드시 `Api` suffix로 끝나게 
- 이는 비즈니스 로직 함수와 API 호출 함수를 명확히 구분하기 위함이다.

```tsx
getUserApi();
createUserApi();
deleteReviewApi();
```

```tsx
// ❌ 비권장
getUser();

// ⭕ 권장
getUserApi();
```

---

## 3. 파일 / 폴더 구조

### 3.1 절대 경로

- 절대 경로 alias로 `@/`를 사용
- 기준 경로는 `src/`이다.

```tsx
import Button from '@/components/Button';
```

---

### 3.2 기본 폴더 구조

```
src/
 ├ components/
 ├ pages/
 ├ hooks/
 ├ apis/
 ├ stores/
 ├ types/
 ├ styles/
 └ constants/
```

---

### 3.3 파일 네이밍 규칙

### 1) 컴포넌트

- **PascalCase** 사용
- 컴포넌트 파일은 `index.tsx`로 통일

```
components/
 └ Button/
    └ index.tsx
```

---

### 2) API 파일

- 파일명은 `.api.ts` suffix를 사용
- 파일명은 `camelCase`를 사용

```
apis/
 ├ auth.api.ts
 └ user.api.ts
```

```tsx
export const getUserApi = async () => {};
```

---

### 3) Store 파일

- 파일명은 `.store.ts` suffix를 사용
- 파일명은 `camelCase`를 사용

```
stores/
 ├ auth.store.ts
 └ userPage.store.ts
```

---

### 4) 기타 파일

- 컴포넌트를 제외한 모든 파일은 `camelCase`를 사용

```tsx
useAuth.ts
dateFormatter.ts
```

---

## 4. TypeScript 규칙

### 4.1 interface / type

- 기본적으로 `interface` 사용을 권장
- `interface` 사용이 불가능한 경우에만 `type`을 사용

---

### 4.2 props 타입 규칙

- 모든 props interface는 **해당 컴포넌트 파일 내부에서 정의**
- props가 하나 이상이면 반드시 `interface`를 정의
- props 타입 정의에는 기본적으로 `interface`를 사용
- props 전달 방식은 **구조 분해 할당 방식과 props 객체 방식 모두 허용**
- 상황에 따라 **가독성이 더 좋은 방식**을 선택

---

### ✅ 방식 1. 구조 분해 할당 방식

- props 개수가 적고
- 컴포넌트 내부에서 바로 사용하는 경우에 적합하다.

```tsx
interface IButtonProps {
  label: string;
  isDisabled: boolean;
}

const Button = ({ label, isDisabled }: IButtonProps) => {
  return (
    <button disabled={isDisabled}>
      {label}
    </button>
  );
};

export default Button;
```

---

### ✅ 방식 2. props 객체 방식

- props 개수가 많거나
- 동일한 props를 여러 곳에서 참조해야 하는 경우에 적합하다.

```tsx
interface IButtonProps {
  label: string;
  isDisabled: boolean;
}

const Button = (props: IButtonProps) => {
  return (
    <button disabled={props.isDisabled}>
      {props.label}
    </button>
  );
};

export default Button;
```

---

### 📌 선택 기준 가이드

- **props 2~3개 이하** → 구조 분해 할당 방식 권장
- **props가 많거나 그룹화가 필요한 경우** → props 객체 방식 권장
- 팀 내에서는 **파일 단위로 하나의 스타일을 선택해 일관성 있게 유지**

---

### 🔹 children 사용 시

- `children`을 사용하는 경우 `PropsWithChildren<>`를 사용

```tsx
import { PropsWithChildren } from 'react';

interface ICardProps {
  title: string;
}

const Card = ({ title, children }: PropsWithChildren<ICardProps>) => {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
};

export default Card;
```

---

### 4.3 null / undefined

- 값이 없음을 표현할 때는 `null`을 사용
- 조건문에서는 truthy / falsy 체크를 권장

```tsx
if (!value) return;
```

---

### 4.4 any 타입

- `any` 타입 사용을 금지
- 불가피한 경우 `unknown`을 사용하고 타입 가드를 적용

---

## 5. 함수 / 로직 규칙

본 섹션의 컨벤션은 **폐기**

- 함수 인자 개수 제한 없음
- else 사용 제한 없음
- Promise 사용 제한 없음

가독성과 명확성을 기준으로 개발자 판단에 맡긴다.

---

## 6. 주석 규칙

### 6.1 함수 주석

- 함수의 역할을 설명하는 주석은 **한 줄 주석**으로 작성
- 형식은 아래와 같이 통일

```tsx
// #. 로그인 처리 핸들러 함수
const handleLogin = async () => {
  // ...
};
```

---

### 6.2 JSDoc 사용 규칙

- **자세한 설명이 필요한 경우에만 JSDoc을 사용**
- 대상:
    - interface
    - API 호출 함수
    - 공용 유틸 함수
    - 복잡한 비즈니스 로직

```tsx
/**
 * 사용자 로그인 API 호출
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns 로그인 성공 여부
 */
export const loginApi = async (
  email: string,
  password: string,
): Promise<boolean> => {
  // ...
};
```

---

### 6.3 일반 주석

- 그 외의 경우에는 일반 한 줄 주석(`//`)을 사용

```tsx
// 버튼 비활성화 처리
if (isDisabled) return;
```

---

### 6.4 TODO / FIXME

```tsx
// TODO: 로그인 API 연동 후 제거
// FIXME: 특정 조건에서 에러 발생
```

---

## 7. import 규칙

### 7.1 import 순서

1. React 및 외부 라이브러리
2. 절대 경로 (`@/`)
3. 상대 경로
4. 스타일 파일

```tsx
import { useState } from 'react';

import { loginApi } from '@/apis/auth.api';
import Button from '@/components/Button';

import styles from './styles';xx
```

---

## 8. console.log 규칙

- `console.log` 사용을 금지
- 디버깅 목적으로 사용한 경우 반드시 제거
- 추후 logger 도입 가능하다.

---

## 9. CSS / 스타일링

- `rem` 단위 사용을 권장
- 스타일 관련 네이밍은 **역할과 의미가 드러나도록** 작성