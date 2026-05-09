# 서버 TypeScript 마이그레이션 가이드

## 개요

백엔드 서버가 JavaScript에서 TypeScript로 마이그레이션되었습니다. 절대 경로 `@` 설정이 적용되어 있습니다.

## 프로젝트 구조

```
server/
├── src/
│   ├── config/
│   │   └── dbConfig.ts         # DB 설정
│   ├── controllers/
│   │   ├── AuthController.ts   # 인증 로직
│   │   └── userController2.ts   # 사용자 관리 로직
│   ├── middleware/
│   │   └── authMiddleware.ts   # 인증 미들웨어
│   ├── routes/
│   │   ├── auth.ts             # 인증 라우트
│   │   └── users2.ts            # 사용자 라우트
│   ├── types/
│   │   ├── index.ts            # 일반 API 타입
│   │   ├── auth.ts             # 인증 타입
│   │   └── user.ts             # 사용자 타입
│   └── server.ts               # 메인 서버 파일
├── dist/                        # 컴파일된 JavaScript (빌드 산출물)
├── package.json
├── tsconfig.json               # TypeScript 설정
├── .env                        # 환경 변수
└── init.sql                    # DB 초기화 스크립트
```

## 절대 경로 (`@`) 사용

절대 경로를 사용하려면 `@/` 접두사를 사용합니다:

```typescript
// ❌ 상대 경로 (사용하지 않기)
import pool from '../config/dbConfig';
import authMiddleware from '../middleware/authMiddleware';

// ✅ 절대 경로 (권장)
import pool from '@/config/dbConfig';
import authMiddleware from '@/middleware/authMiddleware';
```

이는 `tsconfig.json`의 다음 설정으로 인해 가능합니다:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 개발 환경 실행

```bash
# 의존성 설치
npm install

# 감시 모드로 TypeScript 컴파일
npx tsc --watch

# 또는 ts-node로 직접 실행 (개발 용도)
npm run dev
```

## 프로덕션 빌드

```bash
# TypeScript 컴파일
npm run build

# 빌드된 파일 실행
npm start
```

## 클라이언트와 타입 공유

클라이언트(`/client/src/types/`)와 서버(`/server/src/types/`)의 타입 정의를 동기화해야 합니다.

### 동기화 필요 파일

- **auth.ts**: 로그인/로그아웃/토큰 갱신 요청/응답 타입
- **user.ts**: 사용자 생성/조회/수정/삭제 요청/응답 타입

```typescript
// server/src/types/auth.ts
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

클라이언트에서 이와 동일한 타입을 `client/src/types/auth.ts`에 정의하면,
API 호출 시 타입 안전성을 보장할 수 있습니다.

## 에러 처리

TypeScript 컴파일 중 에러가 발생하면:

```bash
# 현재 줄 에러 표시
npx tsc

# 상세 정보 보기
npx tsc --diagnostics
```

## 스크립트 명령어

| 명령어             | 설명                 |
|-----------------|--------------------|
| `npm run dev`   | 개발 모드 실행 (ts-node) |
| `npm run build` | TypeScript 컴파일     |
| `npm start`     | 빌드된 파일 실행          |
| `npm test`      | 테스트 실행             |

## 주의사항

1. **환경 변수**: `.env` 파일에 다음 변수가 필요합니다:
    - `JWT_SECRET`: JWT 서명 키
    - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: DB 연결 정보
    - `NODE_ENV`: 실행 환경 (development/production)
    - `PORT`: 서버 포트 (기본값: 3000)

2. **dist 폴더**: 빌드 산출물이므로 `.gitignore`에 포함되어 있습니다.

3. **타입 업데이트**: 새로운 API 엔드포인트를 추가할 때는 반드시:
    - `src/types`에 타입 정의 추가
    - 클라이언트 타입도 함께 업데이트

