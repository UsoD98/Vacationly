# 풀스택 프로젝트 TypeScript & 절대경로 설정 가이드

## 개요

이 프로젝트는 클라이언트(React + Vite)와 서버(Express)가 모두 TypeScript로 작성되었으며, 
절대 경로(`@/`) 설정이 적용되어 있습니다.

## 프로젝트 구조

```
Vacationly/
├── client/                  # React 프론트엔드
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── types/
│   │   │   ├── index.ts     # 모든 타입 내보내기
│   │   │   ├── auth.ts      # 인증 타입 (로그인, 토큰 등)
│   │   │   └── user.ts      # 사용자 타입
│   │   ├── api/             # API 클라이언트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── stores/          # 상태 관리 (Zustand 등)
│   │   └── utils/           # 유틸리티 함수
│   └── tsconfig.app.json    # TypeScript 설정 (절대경로 `@/` 포함)
│
└── server/                  # Express 백엔드
    ├── src/
    │   ├── config/          # DB 설정
    │   ├── controllers/      # 비즈니스 로직
    │   ├── middleware/       # 미들웨어
    │   ├── routes/          # API 라우트
    │   ├── types/           # TypeScript 타입 정의
    │   │   ├── index.ts     # 일반 API 타입
    │   │   ├── auth.ts      # 인증 타입
    │   │   └── user.ts      # 사용자 타입
    │   └── server.ts        # 메인 서버 파일
    ├── dist/                # 컴파일된 JavaScript
    └── tsconfig.json        # TypeScript 설정 (절대경로 `@/` 포함)
```

## 절대경로 사용법

### 클라이언트 (`@/` 사용)

```typescript
// ❌ 상대경로 (사용하지 않기)
import Button from '../../../components/Button';
import { authStore } from '../../../stores/authStore';

// ✅ 절대경로 (권장)
import Button from '@/components/Button';
import { authStore } from '@/stores/authStore';
import { User, AuthResponse } from '@/types';
```

### 서버 (`@/` 사용)

```typescript
// ❌ 상대경로 (사용하지 않기)
import pool from '../config/dbConfig';
import authMiddleware from '../middleware/authMiddleware';

// ✅ 절대경로 (권장)
import pool from '@/config/dbConfig';
import authMiddleware from '@/middleware/authMiddleware';
import { User, LoginRequest } from '@/types/user';
```

## 타입 공유 및 동기화

클라이언트와 서버가 동일한 타입을 사용해야 API 호출이 타입 안전하게 작동합니다.

### 주요 타입 파일

#### 1. 인증 타입 (`auth.ts`)

**서버**: `server/src/types/auth.ts`
```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: { id: number; name: string; email: string };
}
```

**클라이언트**: `client/src/types/auth.ts`
```typescript
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: { id: number; name: string; email: string };
}
```

#### 2. 사용자 타입 (`user.ts`)

**서버**: `server/src/types/user.ts`
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  hire_date?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  hire_date: string;
}
```

**클라이언트**: `client/src/types/user.ts`
```typescript
// 서버와 동일한 타입 정의
```

### 타입 동기화 방법

1. **서버에서 새 API 엔드포인트 추가**
   - `server/src/types/`에 타입 정의 추가
   - 컨트롤러 구현

2. **클라이언트에서 동일한 타입 추가**
   - `client/src/types/`에 서버와 동일한 타입 정의
   - API 클라이언트 구현

3. **타입 재사용**
   ```typescript
   // client/src/api/auth.ts
   import axios from 'axios';
   import { LoginRequest, AuthResponse } from '@/types';

   export const login = async (data: LoginRequest): Promise<AuthResponse> => {
     const response = await axios.post('/api/auth/login', data);
     return response.data;
   };
   ```

## 개발 가이드

### 클라이언트 개발

```bash
cd client

# 개발 서버 시작
npm run dev

# TypeScript 타입 체크
npm run type-check

# 빌드
npm run build
```

**절대경로 설정**: `client/tsconfig.app.json`에서 관리

### 서버 개발

```bash
cd server

# 개발 모드 실행 (ts-node)
npm run dev

# TypeScript 컴파일
npm run build

# 프로덕션 실행
npm start
```

**절대경로 설정**: `server/tsconfig.json`에서 관리

## 주의사항

### 1. 타입 정의 순서

```typescript
// ❌ 잘못된 순서
import { User } from '@/types';  // user.ts가 없으면 에러

// ✅ 올바른 순서
import { User } from '@/types/user';
// 또는
import * as Types from '@/types';  // index.ts가 모든 것을 내보내야 함
```

### 2. 환경 변수

**클라이언트**: `client/.env.local`
```
VITE_API_BASE_URL=http://localhost:3000
```

**서버**: `server/.env`
```
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=vacationly
NODE_ENV=development
PORT=3000
```

### 3. CORS 설정

서버에서 클라이언트 URL을 허용해야 합니다:

```typescript
// server/src/server.ts
const allowedOrigins = ['http://localhost:5173', 'https://yourdomain.com'];
```

## 새로운 API 엔드포인트 추가하기

### 예: 새로운 사용자 상태(Status) 엔드포인트

**1단계: 서버 타입 정의**
```typescript
// server/src/types/user.ts
export interface UserStatus {
  id: number;
  status: 'active' | 'inactive' | 'pending';
  updated_at: string;
}
```

**2단계: 서버 컨트롤러**
```typescript
// server/src/controllers/userController.ts
export const getUserStatus = async (req: Request, res: Response): Promise<void> => {
  // ... 구현
};
```

**3단계: 서버 라우트**
```typescript
// server/src/routes/users.ts
router.get('/:id/status', userController.getUserStatus);
```

**4단계: 클라이언트 타입 추가**
```typescript
// client/src/types/user.ts
export interface UserStatus {
  id: number;
  status: 'active' | 'inactive' | 'pending';
  updated_at: string;
}
```

**5단계: 클라이언트 API 클라이언트**
```typescript
// client/src/api/user.ts
import { UserStatus } from '@/types';

export const getUserStatus = async (userId: number): Promise<UserStatus> => {
  const response = await axios.get(`/api/users/${userId}/status`);
  return response.data.data;
};
```

## 트러블슈팅

### 절대경로 인식 안 됨
```
Cannot find module '@/...'
```

**해결방법**:
1. IDE 재시작
2. TypeScript 컴파일러 업데이트: `npm install -D typescript@latest`
3. VS Code에서 "Reload Window" 실행

### 타입 불일치 에러

**해결방법**:
1. 서버와 클라이언트 타입 정의 비교
2. 단순 오타나 필드 누락 확인
3. `npm run build`로 서버 컴파일 확인

### CORS 에러

**해결방법**:
1. `server/src/server.ts`의 `allowedOrigins` 확인
2. 클라이언트 URL 확인: `http://localhost:5173`
3. 쿠키 설정 확인 (HttpOnly, SameSite)

## 유용한 명령어

```bash
# 클라이언트
cd client && npm run dev       # 개발 서버 시작
cd client && npm run build     # 프로덕션 빌드
cd client && npm run preview   # 빌드 결과물 미리보기

# 서버
cd server && npm run dev       # 개발 모드
cd server && npm run build     # TypeScript 컴파일
cd server && npm start         # 프로덕션 실행

# 전체
npm install                   # 모든 의존성 설치
```

## 참고 문서

- [클라이언트 TypeScript 설정](./client/README.md)
- [서버 TypeScript 설정](./server/TYPESCRIPT_SETUP.md)
- [클라이언트 Vite 설정](./client/vite.config.ts)
- [서버 tsconfig](./server/tsconfig.json)

