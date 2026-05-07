# Vacationly - MariaDB CRUD 통합 프로젝트

이 프로젝트는 Electron 프론트엔드와 Express 백엔드를 연동하여 MariaDB 기반의 사용자 관리 CRUD 시스템을 구현합니다.

## 🎯 빠른 시작

### 1단계: MariaDB 테이블 생성

```bash
# MariaDB CLI 실행
mysql -u root -p

# 다음 명령어 실행
CREATE DATABASE vacationly;
USE vacationly;

-- server/init.sql의 내용을 복사해서 실행하거나 다음 명령어 사용:
SOURCE server/init.sql;
```

### 2단계: 백엔드 서버 실행

```bash
cd server
npm start
# 포트 3000에서 서버 시작
```

### 3단계: 프론트엔드 실행

```bash
cd client
npm run dev
# 또는 Electron 앱으로 실행: npm run electron
```

### 4단계: About 페이지에서 CRUD 테스트

- 브라우저에서 About 페이지로 이동
- 사용자 추가/수정/삭제 테스트

## 📁 프로젝트 구조

```
Vacationly/
├── client/              # 프론트엔드 (Electron + React + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── About.tsx          ⭐ CRUD UI 구현됨
│   │   │   └── About.module.css   ⭐ 스타일 (Tailwind 제외)
│   │   ├── components/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
│
├── server/              # 백엔드 (Express + MariaDB)
│   ├── config/
│   │   └── dbConfig.js           # DB 연결 설정
│   ├── controllers/
│   │   └── userController.js     # CRUD 로직
│   ├── routes/
│   │   └── users.js              # API 라우트
│   ├── server.js                 # 메인 서버
│   ├── init.sql                  # DB 초기화 스크립트
│   ├── .env                      # 환경 변수
│   └── package.json
│
├── SETUP_GUIDE.md       # 상세 설정 가이드
└── README.md            # 이 파일
```

## 📡 구현된 API 엔드포인트

| 메소드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/users` | 모든 사용자 조회 |
| GET | `/api/users/:id` | 특정 사용자 조회 |
| POST | `/api/users` | 사용자 생성 (Create) |
| PUT | `/api/users/:id` | 사용자 수정 (Update) |
| DELETE | `/api/users/:id` | 사용자 삭제 (Delete) |

## 🎨 프론트엔드 기능

About.tsx 페이지에서:
- ✅ **사용자 목록 표시**: 테이블 형식으로 모든 활성 사용자 표시
- ✅ **사용자 추가**: 폼으로 새 사용자 추가
- ✅ **사용자 수정**: 목록에서 선택하여 정보 수정
- ✅ **사용자 삭제**: 소프트 삭제로 사용자 제거
- ✅ **에러/성공 메시지**: 작업 결과 피드백
- ✅ **검증**: 필수 필드 입력, 이메일 중복 검사

## 🗄️ MariaDB 스키마

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL DEFAULT '' COMMENT '이름',
    email VARCHAR(50) NOT NULL DEFAULT '' COMMENT '이메일',
    password VARCHAR(255) NOT NULL DEFAULT '' COMMENT '비밀번호',
    hire_date VARCHAR(8) NOT NULL DEFAULT '' COMMENT '입사일(yyyyMMdd)',
    created_at VARCHAR(14) NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)',
    del_flag TINYINT NOT NULL DEFAULT 0 COMMENT '탈퇴여부 0:No/1:Yes'
);
```

## 🛠️ 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite + Electron
- **백엔드**: Node.js + Express 5.x
- **데이터베이스**: MariaDB + MySQL2/Promise
- **스타일링**: CSS Modules (Tailwind CSS 미사용)

## 📋 환경 변수 설정

### server/.env
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=vacationly
DB_CHARSET=utf8mb4
```

## 🚀 주요 파일 설명

| 파일 | 설명 |
|------|------|
| `About.tsx` | React 상태 관리 및 CRUD UI 렌더링 |
| `userController.js` | Create, Read, Update, Delete 로직 구현 |
| `users.js` | RESTful API 라우트 정의 |
| `dbConfig.js` | MariaDB 연결 풀 설정 |
| `server.js` | Express 앱 초기화 및 미들웨어 설정 |

## 🧪 테스트 시나리오

1. 서버 시작 후 `/api/health` 엔드포인트로 상태 확인
2. About 페이지에서 새 사용자 추가
3. 목록에서 사용자 정보 확인
4. 사용자 정보 수정
5. 사용자 삭제

## ⚙️ 문제 해결

### 연결 오류
- MariaDB 서비스 실행 중인지 확인
- `.env` 파일의 DB 설정 확인
- 방화벽 포트 3000 개방 확인

### CORS 오류
- 백엔드 서버 실행 중인지 확인
- 프론트엔드의 API_BASE_URL이 올바른지 확인

자세한 설정 가이드는 `SETUP_GUIDE.md`를 참조하세요.

---

**작성일**: 2026년 5월 7일  
**버전**: 1.0.0

