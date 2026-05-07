# Vacationly 풀스택 프로젝트

Electron 기반 프론트엔드와 Express 백엔드를 통합한 사용자 관리 시스템입니다.

## 📁 프로젝트 구조

```
Vacationly/
├── client/                    # 프론트엔드 (Electron + React + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── About.tsx     # CRUD UI 구현
│   │   │   ├── About.module.css
│   │   │   ├── Home.tsx
│   │   │   └── Index.tsx
│   │   ├── components/
│   │   ├── stores/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── electron/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── server/                    # 백엔드 (Node.js + Express)
│   ├── config/
│   │   └── dbConfig.js       # MariaDB 연결 설정
│   ├── controllers/
│   │   └── userController.js # CRUD 로직
│   ├── routes/
│   │   └── users.js          # API 라우트
│   ├── server.js             # 메인 서버 파일
│   ├── init.sql              # 데이터베이스 초기화 스크립트
│   ├── .env                  # 환경 변수
│   └── package.json
│
└── README.md                 # 이 파일
```

## 🚀 설정 및 실행 방법

### 1. MariaDB 설정

MariaDB를 설치하고 다음 명령어로 데이터베이스와 테이블을 생성합니다:

```bash
# MariaDB CLI에서
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE vacationly;
USE vacationly;

# 테이블 생성 (server/init.sql 파일의 내용을 복사해서 실행)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL DEFAULT '' COMMENT '이름',
    email VARCHAR(50) NOT NULL DEFAULT '' COMMENT '이메일',
    password VARCHAR(255) NOT NULL DEFAULT '' COMMENT '비밀번호',
    hire_date VARCHAR(8) NOT NULL DEFAULT '' COMMENT '입사일(yyyyMMdd)',
    created_at VARCHAR(14) NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)',
    del_flag TINYINT NOT NULL DEFAULT 0 COMMENT '탈퇴여부 0:No/1:Yes'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_del_flag ON users(del_flag);
```

### 2. 백엔드 서버 실행

```bash
# server 디렉토리로 이동
cd server

# 패키지 설치 (처음 한 번만)
npm install

# 환경 변수 설정 (.env 파일을 필요에 맞게 수정)
# 기본 설정: localhost, 포트 3306, 사용자명 root, 비밀번호 없음

# 서버 시작 (포트 3000)
npm start
```

### 3. 프론트엔드 실행

**개발 모드:**
```bash
# client 디렉토리로 이동
cd client

# 패키지 설치 (처음 한 번만)
npm install

# 개발 서버 시작
npm run dev
```

**Electron 앱 실행:**
```bash
# client 디렉토리에서
npm run electron
```

## 📡 API 엔드포인트

모든 API는 `http://localhost:3000/api/users`를 기본 URL로 합니다.

### 1. 모든 사용자 조회
```
GET /api/users
응답: { success: true, data: [...] }
```

### 2. 특정 사용자 조회
```
GET /api/users/:id
응답: { success: true, data: {...} }
```

### 3. 사용자 생성 (Create)
```
POST /api/users
요청 본문:
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123",
  "hire_date": "20260507"
}
응답: { success: true, message: "사용자가 추가되었습니다", data: {...} }
```

### 4. 사용자 정보 수정 (Update)
```
PUT /api/users/:id
요청 본문:
{
  "name": "수정된이름",
  "email": "updated@example.com",
  "password": "newpassword",
  "hire_date": "20260508"
}
응답: { success: true, message: "사용자 정보가 수정되었습니다" }
```

### 5. 사용자 삭제 (Delete) - 소프트 삭제
```
DELETE /api/users/:id
응답: { success: true, message: "사용자가 삭제되었습니다" }
```

> **Note**: 삭제는 소프트 삭제 방식이므로 데이터가 완전히 삭제되지 않고 `del_flag`가 1로 표시됩니다.

## 🎨 프론트엔드 CRUD UI

About 페이지에서 사용자 관리 기능을 모두 사용할 수 있습니다:

- **사용자 추가**: 폼에 정보를 입력하고 "사용자 추가" 버튼 클릭
- **사용자 목록**: 등록된 모든 사용자가 테이블로 표시됨
- **사용자 수정**: 목록에서 "수정" 버튼 클릭 후 정보 수정
- **사용자 삭제**: 목록에서 "삭제" 버튼 클릭하여 사용자 제거

> **CSS 스타일**: Tailwind CSS 없이 순수 CSS 모듈(`About.module.css`)로 스타일링

## 🔧 트러블슈팅

### 1. CORS 에러 발생
백엔드 서버가 CORS를 지원하도록 설정되어 있습니다. 확인:
- 서버가 `http://localhost:3000`에서 실행 중인지 확인
- 클라이언트가 정확한 API URL을 사용 중인지 확인

### 2. 데이터베이스 연결 실패
`.env` 파일의 설정을 확인하세요:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=(비밀번호)
DB_NAME=vacationly
```

### 3. 포트 충돌
기본 포트 3000이 사용 중이면 `server/.env`에서 `PORT` 값을 변경하세요.

## 📝 주요 기능

- ✅ 사용자 생성 (Create)
- ✅ 사용자 조회 (Read)
- ✅ 사용자 정보 수정 (Update)
- ✅ 사용자 삭제 (Delete - 소프트 삭제)
- ✅ 이메일 중복 검사
- ✅ 에러 처리 및 사용자 피드백
- ✅ 반응형 UI (Tailwind 제외)

## 📦 기술 스택

### 프론트엔드
- React 18+
- TypeScript
- Vite
- Electron (데스크톱 앱)
- CSS Modules

### 백엔드
- Node.js
- Express 5.x
- MySQL2/Promise
- MariaDB

## 🔐 보안 고려사항

현재는 예시 프로젝트이므로 프로덕션 환경에서는 다음을 추가하세요:

- JWT 기반 인증
- 비밀번호 해싱 (bcrypt 사용)
- Input 검증 및 sanitization
- SQL 인젝션 방지 (이미 파라미터화된 쿼리 사용)
- HTTPS 설정
- Rate limiting

## 📞 커스터마이징

### 데이터베이스 스키마 수정
`server/init.sql`에서 사용자 테이블 정의를 수정하고, 
`server/controllers/userController.js`의 쿼리를 업데이트하세요.

### UI 스타일 수정
`client/src/pages/About.module.css`에서 CSS를 수정하세요.

### API 엔드포인트 추가
`server/routes/users.js`에 새로운 라우트를 추가하고,
`server/controllers/userController.js`에 해당 로직을 구현하세요.

---

**마지막 업데이트**: 2026년 5월 7일

