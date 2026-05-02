# Vite + React + TypeScript + Tailwind + DaisyUI + lucide-react 프로젝트 설정 가이드

## 1) 절대 경로 설정: `@`

우선 절대 경로 설정을 위해 @types/node 패키지를 개발 의존성으로 설치합니다.

```bash
npm install -D @types/node
```

그리고 Vite 설정 파일인 `vite.config.ts`에서 절대 경로 설정을 추가합니다.

```ts
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
});
```

또한 TypeScript 설정 파일인 `tsconfig.app.json`에서도 절대 경로 설정
을 추가합니다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "strict": true,
    "resolveJsonModule": true,
    "ignoreDeprecations": "6.0"
  }
}
```

> 참고 : 앱 코드의 import는 가능한 한 모두 `@/`를 사용합니다. <br/>
> 현재 프로젝트는 `tsconfig.node.json`도 함께 사용하므로 Vite 설정 파일은 해당 설정의 영향을 받습니다.

## 2) 스타일링 셋업: Tailwind v4 + daisyUI + lucide-react

Tailwind CSS와 daisyUI, lucide-react 아이콘 라이브러리를 설치합니다.

```bash
npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@ lucide-react
```

그리고 `src/index.css` 파일에서 Tailwind와 daisyUI를 불러옵니다.

```css
@import "tailwindcss";

@plugin "daisyui/index.js";
```

vite.config.ts 파일에서 Tailwind CSS 플러그인을 추가합니다.

```ts
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
});
```

### 확인 포인트

- Tailwind 4버전 환경이므로 기존 `tailwind.config.ts` 파일은 생성하지 않습니다.
- daisyUI는 Tailwind CSS의 플러그인으로, Tailwind 설정 파일이 없어도 기본 스타일이 적용됩니다. 필요에 따라 daisyUI의 테마 설정을 추가할 수 있습니다.
- lucide-react는 아이콘 라이브러리로, 필요한 아이콘을 컴포넌트로 불러와 사용할 수 있습니다.
- 이제 프로젝트에서 절대 경로와 Tailwind CSS, daisyUI, lucide-react를 활용하여 스타일링을 진행할 수 있습니다.

## 3) 진입점 설정

`src/main.tsx` 파일에서 React 애플리케이션의 진입점을 설정합니다.

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from '@/App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App/>
  </StrictMode>
);
```

이제 절대 경로와 Tailwind CSS, daisyUI, lucide-react를 활용하여 개발을 시작할 수 있습니다.

## 4) 클래스 유틸리티: `cn`

tailwind CSS를 사용할 때 발생할 수 있는 클래스 이름의 중복 문제를 해결하기 위해 유틸리티 함수를 추가합니다.
이를 위해 필요한 패키지를 설치합니다.

```bash
npm install clsx tailwind-merge
```

`src/utils/cn.ts` 파일을 생성하여 클래스 이름을 조건부로 조합하는 유틸리티 함수를 추가합니다.

```ts
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 5) Prettier 설정

`TailWind CSS` 사용 시 클래스명이 길어지는 경우가 많으므로, Prettier 설정을 통해 클래스명을 자동으로 줄바꿈하도록 설정합니다.
터미널에서 Prettier와 Tailwind 정렬 플러그인을 설치합니다.

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

`.prettierrc` 파일을 생성하여 Prettier 설정을 추가합니다.

```json
{
  "plugins": [
    "prettier-plugin-tailwindcss"
  ],
  // Tailwind CSS 클래스 정렬 플러그인 추가
  "tailwindConfig": "./tailwind.config.js",
  // Tailwind CSS 설정 파일 경로 지정
  "tailwindStylesheet": "./src/index.css",
  // Tailwind CSS가 포함된 스타일시트 경로 지정
  "singleQuote": true,
  // 문자열을 작은따옴표로 감싸도록 설정
  "semi": true,
  // 문장 끝에 세미콜론을 추가하도록 설정
  "trailingComma": "all"
  // 여러 줄에서 마지막 요소 뒤에 쉼표를 추가하도록 설정
}
```

### 확인 포인트

- `prettier-plugin-tailwindcss` 플러그인을 사용하여 Tailwind CSS 클래스 이름이 자동으로 정렬되고 줄바꿈되도록 설정합니다.
- `tailwindConfig`와 `tailwindStylesheet` 옵션을 통해 Prettier가 Tailwind CSS 설정 파일과 스타일시트를 인식하도록 지정합니다.
- Prettier의 다른 설정(`singleQuote`, `semi`, `trailingComma`)도 프로젝트의 코드 스타일에 맞게 조정할 수 있습니다.
- 이제 Prettier를 사용하여 코드를 포맷할 때 Tailwind CSS 클래스 이름이 자동으로 정렬되고 줄바꿈되어 가독성이 향상됩니다.

## 6) 레이아웃 및 라우터 설정

React Router를 설치하여 라우팅 기능을 추가합니다.

```bash
npm install react-router-dom
```

그리고 `src/routes/router.tsx` 파일에서 라우터 설정을 추가합니다.

```tsx
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {lazy, Suspense} from "react";
import Layout from "@/components/layout/Layout.tsx";
import Loading from "@/components/common/Loading.tsx";
import NotFound from '@/components/layout/NotFoundLayout.tsx';
import RootLayout from '@/components/layout/RootLayout.tsx';

const LoadingComponent = <Loading/>;
const Index = lazy(() => import('@/pages/Index'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout/>,
    children: [
      {
        element: <RootLayout/>,
        errorElement: <NotFound/>,
        children: [
          {
            index: true,
            element: <Suspense fallback={LoadingComponent}><Index/></Suspense>,
          },
        ]

      }
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router}/>;
}
```

이제 `src/App.tsx` 파일에서 라우터를 불러와 애플리케이션의 루트 컴포넌트로 설정합니다.

```tsx
import AppRouter from '@/routes/router.tsx';

export default function App() {
  return <AppRouter/>;
}
```

### 확인 포인트

- `createBrowserRouter`를 사용하여 라우터를 설정하고, `RouterProvider`로 애플리케이션에 라우터를 제공합니다.
- `Suspense`를 사용하여 라우트 컴포넌트가 로드되는 동안 로딩 컴포넌트를 표시합니다.
- `Lazy`를 사용하여 라우트 컴포넌트를 동적으로 불러와 초기 로딩 시간을 줄입니다.
- 각 path에 대한 레이아웃과 에러 페이지를 설정하여 사용자 경험을 향상시킵니다.
- `children` 배열을 사용하여 중첩된 라우트를 설정할 수 있습니다. 예를 들어, `/about` 경로를 추가하려면 `children` 배열에 새로운 객체를 추가하면 됩니다.
- `children` 내에서도 새로운 {any}router.tsx 파일을 만들어 라우팅 설정을 분리할 수 있습니다. 예를 들어, `src/routes/userRouter.tsx` 파일을 만들어 `/user` 경로에
  대한 라우팅 설정을 추가할 수 있습니다.

router 설정에 포함되는 레이아웃 및 Index 페이지 컴포넌트는 각각 구현하시면 됩니다. 이제 라우팅이 설정된 React 애플리케이션을 개발할 수 있습니다.

## 7) 상태 관리: `Zustand`

상태 관리를 위해 `Zustand` 라이브러리를 설치합니다.
상태 관리란 애플리케이션의 상태를 중앙에서 관리하는 것을 의미합니다. 이를 통해 컴포넌트 간에 상태를 쉽게 공유하고 관리할 수 있습니다.

```bash
npm install zustand
```

daisyUI를 설치하였으니 테마 설정을 상태 관리 라이브러리를 통해 유지 및 관리할 수 있습니다.
`src/stores/themeStore.ts` 파일을 생성하여 테마 상태를 관리하는 Zustand 스토어를 설정합니다.

```ts
import {create} from 'zustand'

export const themes = ['light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate'];

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  nextTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // 초기 테마 설정 (시스템 테마나 로컬 스토리지 사용 가능)
  theme: localStorage.getItem('theme') || themes[0],

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({theme});
  },

  nextTheme: () => {
    const {theme, setTheme} = useThemeStore.getState();
    const currentIndex = themes.indexOf(theme);
    // 다음 인덱스 계산 (마지막이면 다시 0으로)
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }
}));

// 초기 실행 시 스토어 테마 적용
const savedTheme = localStorage.getItem('theme') || themes[0];
document.documentElement.setAttribute('data-theme', savedTheme);
```

`useThemeStore` 훅을 사용하여 현재 테마 상태를 가져오고, `nextTheme` 함수를 호출하여 다음 테마로 전환하는 버튼을 구현합니다. 버튼을 클릭할 때마다 테마가 변경되고, 변경된 테마는 로컬
스토리지에 저장되어 페이지를 새로고침해도 유지됩니다.

라우터 설정을 위해 생성한 Index 페이지에서 테마 전환 버튼을 추가하여 Zustand 스토어를 활용하는 예시입니다.

```tsx
import {useThemeStore} from "@/stores/themeStore.ts";

export default function Index() {
  const {theme, nextTheme} = useThemeStore();

  return (
    <>
      {/* 테마 토글 버튼 */}
      <div className="p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">테마: {theme}</h1>
        <p className="py-4 text-base-content/80">
          Tailwind v4와 daisyUI, Zustand로 구현한 테마입니다.
        </p>
        <button className="btn btn-accent" onClick={nextTheme}>Toggle Button</button>
      </div>
    </>
  )
}
```

### 확인 포인트

- Zustand를 사용하여 테마 상태를 중앙에서 관리하고, 컴포넌트에서 쉽게 접근할 수 있도록 설정합니다.
- 테마 전환 버튼을 클릭할 때마다 `nextTheme` 함수를 호출하여 다음 테마로 전환합니다.
- 변경된 테마는 로컬 스토리지에 저장되어 페이지를 새로고침해도 유지됩니다.
- `data-theme` 속성을 사용하여 daisyUI의 테마를 적용합니다. 이를 통해 Tailwind CSS와 daisyUI의 스타일이 자동으로 변경됩니다.
- Zustand 스토어는 다른 상태 관리에도 활용할 수 있으므로, 테마 외에도 애플리케이션의 다른 상태를 관리하는 데 사용할 수 있습니다.
- 예를 들어, 사용자 인증 상태, 애플리케이션 설정 등을 Zustand 스토어로 관리할 수 있습니다.