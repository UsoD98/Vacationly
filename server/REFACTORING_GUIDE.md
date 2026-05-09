# UserController ~ UserRepository 리팩토링 완료

## 📋 개선 사항 요약

### 1. ✅ 커스텀 에러 핸들러 클래스 (`AppError`)

**생성 파일**: `src/errors/AppError.ts`

- **상태 코드 기반 에러 분류**: 400, 404, 409, 500
- **에러 코드 추가**: 에러 타입을 프론트에서 쉽게 구분 가능
- **정적 팩토리 메서드**: `AppError.badRequest()`, `AppError.conflict()` 등으로 직관적 사용
- **서비스에서 throw**: 컨트롤러에서 자동으로 처리

**사용 예**:
```typescript
throw AppError.conflict('이미 존재하는 이메일입니다.', 'EMAIL_ALREADY_EXISTS');
```

---

### 2. ✅ 강화된 트랜잭션 관리 (`UnitOfWork`)

**수정 파일**: `src/uow/UnifOrWork.ts`

#### 개선 사항:
- **트랜잭션 상태 추적**: `isActive` 플래그로 명확한 상태 관리
- **더블 체크**: `begin()` 호출 시 이미 활성화된 트랜잭션 방지
- **안전한 리소스 해제**: commit/rollback 후 반드시 connection 정리
- **상태 조회 메서드**: `isTransactionActive()` 추가로 트랜잭션 활성화 여부 확인
- **에러 핸들링 강화**: 각 단계에서 AppError 발생

#### 로직 흐름:
```
begin() → (connection 획득 + 트랜잭션 시작) → isActive = true
        ↓
getConnection() → (isActive && conn 검증)
        ↓
commit/rollback → (리소스 정리 + isActive = false)
```

---

### 3. ✅ UserService 개선

**수정 파일**: `src/services/UserService.ts`

#### 개선 사항:
- **AppError 사용**: 명확한 에러 타입 전파
- **isTran 플래그 제거**: `isTransactionActive()` 메서드로 대체
- **비밀번호 암호화**: PasswordService 주입으로 bcrypt 암호화 적용
- **트랜잭션 검증**: begin() 후 isTransactionActive() 확인
- **세분화된 에러**: 이메일 중복, 저장 실패 등 구체적 에러 코드

#### 주요 변화:
```typescript
// 기존: let isTran = false; ... if (isTran) { rollback() }
// 개선: if (this.uow.isTransactionActive()) { rollback() }
```

---

### 4. ✅ UserController 개선

**수정 파일**: `src/controllers/UserController.ts`

#### 개선 사항:
- **입력 검증 강화**: `validateCreateUserInput()` 메서드 분리
  - 필수 필드 검증
  - 이메일 형식 검증 (regex)
  - 비밀번호 최소 길이 검증 (6자)
  - 날짜 형식 검증 (YYYY-MM-DD)
- **데이터 정규화**: 문자열 trim(), 이메일 lowercase
- **AppError 처리**: statusCode와 코드별로 자동 응답
- **명확한 응답 포맷**: success, message, code 필드 정규화

#### 에러 응답:
```json
{
  "success": false,
  "message": "유효하지 않은 이메일 형식입니다",
  "code": "INVALID_EMAIL"
}
```

---

### 5. ✅ UserRepository 강화

**수정 파일**: `src/repositories/UserRepository.ts`

#### 추가 메서드:
- `existsById()`: ID 기반 존재 여부 확인
- `findById()`: ID로 사용자 조회
- `findByEmail()`: 이메일로 사용자 조회

#### 개선 사항:
- **에러 처리**: DB 쿼리 실패 시 AppError 발생
- **MySQL 중복 키 에러 감지**: 'Duplicate entry' 메시지 감지 시 409 conflict 반환
- **모든 쿼리에서 del_flag 검증**: 소프트 딜리트 지원
- **Try-catch**: 각 메서드에서 일관된 에러 처리

---

### 6. ✅ 비밀번호 암호화 서비스

**생성 파일**: `src/services/PasswordService.ts`

- **bcrypt 사용**: `saltRounds = 10`으로 안전한 해싱
- `hashPassword()`: 비밀번호 암호화
- `comparePassword()`: 비밀번호 검증 (로그인 시 사용 예정)
- **AppError 발생**: 암호화 실패 시 체계적 에러 처리

---

### 7. ✅ 라우트 의존성 주입 업데이트

**수정 파일**: `src/routes/user.ts`

- PasswordService 주입 추가
- UserService 생성자에 PasswordService 전달

```typescript
const passwordService = new PasswordService();
const userService = new UserService(userRepository, unitOfWork, passwordService);
```

---

### 8. ✅ 서버 전역 에러 처리 미들웨어

**수정 파일**: `src/server.ts`

- **AppError 인스턴스 체크**: AppError 발생 시 정확한 statusCode 반환
- **구조화된 응답**: success, message, code 필드 포함
- **개발/운영 환경 구분**: 디버그 환경에서만 스택 트레이스 반함

---

### 9. ✅ 패키지 의존성 추가

**수정 파일**: `package.json`

- `bcrypt@^5.1.1`: 비밀번호 암호화
- `@types/bcrypt@^5.0.2`: 타입 정의

---

## 🏗️ 전체 아키텍처 흐름

```
[Client Request]
        ↓
[UserController.createUser()]
    ├─ validateCreateUserInput() - 입력 검증
    └─ throw AppError
        ↓
[UserService.createUser()]
    ├─ begin() - 트랜잭션 시작
    ├─ isTransactionActive() 확인
    ├─ hashPassword() - 비밀번호 암호화
    ├─ existsByEmail() - 중복 확인
    ├─ save() - DB 저장
    ├─ commit() 또는 rollback() - 트랜잭션 처리
    └─ throw AppError
        ↓
[Global Error Handler]
    ├─ AppError 검사
    ├─ statusCode 반환
    └─ 구조화된 응답 전송
        ↓
[Client Response]
```

---

## ✨ 주요 개선 포인트

| 구분 | 기존 | 개선 |
|-----|-----|------|
| **에러 관리** | `throw new Error('메시지')` | `throw AppError.conflict()` |
| **트랜잭션 추적** | `let isTran = false` | `isActive` 플래그 + `isTransactionActive()` |
| **비밀번호** | 평문 저장 | bcrypt 암호화 |
| **입력 검증** | 최소한의 검증 | 정규식 + 길이 + 형식 검증 |
| **에러 응답** | 메시지만 전달 | code 필드로 타입 구분 가능 |
| **DB 에러** | 일반 에러 | MySQL 중복 키 감지 |

---

## 🚀 다음 단계 권장사항

1. **인증 시스템**: `PasswordService.comparePassword()` 활용한 로그인 구현
2. **데이터 검증**: 유효성 검사 라이브러리 (joi, zod) 도입
3. **로깅**: winston 또는 logger 시스템 추가
4. **테스트**: Unit Test (Jest) + Integration Test 작성
5. **API 문서화**: Swagger/OpenAPI 추가
6. **권한 관리**: 역할 기반 접근 제어(RBAC) 구현

---

## 📝 사용 예시

### 성공 사례:
```bash
POST /api/users
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "hire_date": "2026-05-01"
}

Response (201):
{
  "success": true,
  "message": "회원가입에 성공했습니다"
}
```

### 실패 사례 - 이미 존재하는 이메일:
```bash
Response (409):
{
  "success": false,
  "message": "이미 존재하는 이메일입니다.",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

### 실패 사례 - 유효하지 않은 이메일:
```bash
Response (400):
{
  "success": false,
  "message": "유효하지 않은 이메일 형식입니다",
  "code": "INVALID_EMAIL"
}
```

---

## 📦 컴파일 상태
✅ 모든 파일 TypeScript 컴파일 성공
✅ 의존성 설치 완료 (bcrypt 포함)
✅ 타입 안정성 확보

컴파일 방법:
```bash
npm run build
```

개발 서버 실행:
```bash
npm run dev
```

