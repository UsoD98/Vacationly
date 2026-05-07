-- MariaDB 데이터베이스 초기화 스크립트
-- Vacationly 프로젝트용 사용자 테이블

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE vacationly;
-- USE vacationly;

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL DEFAULT '' COMMENT '이름',
    email VARCHAR(50) NOT NULL DEFAULT '' COMMENT '이메일',
    password VARCHAR(255) NOT NULL DEFAULT '' COMMENT '비밀번호',
    hire_date VARCHAR(8) NOT NULL DEFAULT '' COMMENT '입사일(yyyyMMdd)',
    created_at VARCHAR(14) NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)',
    del_flag TINYINT NOT NULL DEFAULT 0 COMMENT '탈퇴여부 0:No/1:Yes'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스 추가
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_del_flag ON users(del_flag);

-- 테스트 데이터 추가 (선택사항)
-- INSERT INTO users (name, email, password, hire_date, created_at, del_flag)
-- VALUES
-- ('홍길동', 'hong@example.com', 'password123', '20200101', '20260507120000', 0),
-- ('김철수', 'kim@example.com', 'password123', '20210615', '20260507120100', 0),
-- ('이영희', 'lee@example.com', 'password123', '20220301', '20260507120200', 0);

