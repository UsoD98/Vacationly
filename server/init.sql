-- 1. 사용자 테이블
CREATE TABLE users
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '이름',
    email      VARCHAR(50)  NOT NULL DEFAULT '' COMMENT '이메일',
    password   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '비밀번호',
    hire_date  VARCHAR(8)   NOT NULL DEFAULT '' COMMENT '입사일(yyyyMMdd)',
    created_at VARCHAR(14)  NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)',
    del_flag   TINYINT      NOT NULL DEFAULT 0 COMMENT '탈퇴여부 0:No/1:Yes'
);

-- 2. 기본 연차 부여 테이블 (매년 1회 발생하는 정기 연차)
CREATE TABLE vacation
(
    user_id            INT           NOT NULL COMMENT 'users 테이블 id',
    vacation_year      VARCHAR(4)    NOT NULL DEFAULT '' COMMENT '기준 연도(yyyy)',
    vacation_available DECIMAL(3, 1) NOT NULL DEFAULT 0.0 COMMENT '기본 부여 연차',
    created_at         VARCHAR(14)   NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)', -- 8에서 14로 수정

    PRIMARY KEY (user_id, vacation_year)                                                 -- 복합 PK
);

-- 3. 추가 연차 테이블 (포상, 대체휴무, 이월 등)
-- 이 테이블은 한 해에 여러 번 발생할 수 있으므로 복합PK 대신 단일 PK(id) 사용
CREATE TABLE vacation_extra
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT           NOT NULL COMMENT 'users 테이블 id',
    vacation_year VARCHAR(4)    NOT NULL DEFAULT '' COMMENT '적용 연도(yyyy)',
    extra_days    DECIMAL(3, 1) NOT NULL DEFAULT 0.0 COMMENT '추가/차감 일수 (+1.0, -0.5 등)',
    category      VARCHAR(20)   NOT NULL DEFAULT '' COMMENT '유형(REWARD:포상, REPLACE:대체, CARRY:이월)',
    reason        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '부여 사유',
    created_at    VARCHAR(14)   NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)',

    INDEX idx_extra_user_year (user_id, vacation_year) -- 검색 속도 향상
);

-- 4. 연차 사용 내역 테이블 (실제 사용 기록)
CREATE TABLE vacation_requests
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT           NOT NULL COMMENT 'users 테이블 id',
    start_date VARCHAR(12)   NOT NULL DEFAULT '' COMMENT '시작일시(yyyyMMddHHmm)',
    end_date   VARCHAR(12)   NOT NULL DEFAULT '' COMMENT '종료일시(yyyyMMddHHmm)',
    used_days  DECIMAL(3, 1) NOT NULL DEFAULT 0.0 COMMENT '사용 일수',
    reason     VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '사용 사유',
    created_at VARCHAR(14)   NOT NULL DEFAULT '' COMMENT '생성일시(yyyyMMddHHmmss)',

    INDEX idx_requests_user_id (user_id)
);
