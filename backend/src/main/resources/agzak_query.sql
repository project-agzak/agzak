/* ===============================================
   agzak MySQL DB update query 2.0.0 / 25.11.11
   =============================================== */
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_0900_ai_ci';

-- 로컬 + ACTIVE 중복 존재 확인
SELECT email, COUNT(*) cnt
FROM member
WHERE password IS NOT NULL AND COALESCE(status, 'ACTIVE') = 'ACTIVE'
GROUP BY email
HAVING cnt > 1;

-- status NULL 있는지 확인
SELECT COUNT(*) AS null_status_cnt FROM member WHERE status IS NULL;

-- 1) 이메일 유니크 제거
ALTER TABLE member DROP INDEX UQ_member_email;

-- 2) 컬럼 정규화
-- email을 NULL 허용으로 변경
ALTER TABLE member MODIFY email VARCHAR(255) NULL;

-- status NOT NULL + 기본값
-- UPDATE member SET status = 'ACTIVE' WHERE status IS NULL;
ALTER TABLE member MODIFY status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';

-- 3) 생성 컬럼 추가
--  '일반 회원(비밀번호 존재) + ACTIVE'인 경우에만 email 값을 반영, 나머지는 NULL
ALTER TABLE member
    ADD COLUMN email_local_unique VARCHAR(255)
        GENERATED ALWAYS AS (
            IF(password IS NOT NULL AND status = 'ACTIVE', email, NULL)
            ) STORED;

-- 4) UNIQUE 인덱스 생성 (NULL은 중복 허용 → 소셜/탈퇴는 무제약)
CREATE UNIQUE INDEX UQ_member_email_local_active ON member (email_local_unique);

/* ===============================================
   agzak MySQL DB update query 2.0.1 / 25.11.12
   =============================================== */
CREATE TABLE `collection` (
                              `collection_id` BIGINT      NOT NULL AUTO_INCREMENT,
                              `member_id`     BIGINT      NOT NULL,
                              `type`          VARCHAR(50) NOT NULL COMMENT 'ENUM(`MONEY`, `LOVE`, `ACHIEVEMENT`, `HEALTH`, `MIXED`, `ROTTEN`)',
                              `count`         INT         NOT NULL DEFAULT 0,
                              `description`   VARCHAR(255) NULL,
                              `obtained_at`   DATETIME    NULL,
                              PRIMARY KEY (`collection_id`),
                              UNIQUE KEY `UQ_collection_member_type` (`member_id`, `type`),
                              KEY `IDX_collection_member` (`member_id`),
                              CONSTRAINT `FK_collection_member`
                                  FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                      ON DELETE CASCADE ON UPDATE CASCADE,
                              CONSTRAINT `CK_collection_type_nonblank` CHECK (LENGTH(TRIM(`type`)) > 0)
) ENGINE=InnoDB;

ALTER TABLE fortune_cookie
    MODIFY status VARCHAR(50) NOT NULL
        COMMENT 'ENUM(`AVAILABLE`, `USED`, `DELETED`)';

/* ===============================================
   agzak MySQL DB update query 2.0.2 / 25.11.13
   =============================================== */
CREATE TABLE IF NOT EXISTS `cookie_daily_usage` (
                                                    `cookie_daily_usage_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                                    `member_id`             BIGINT      NOT NULL,
                                                    `use_date`              DATE        NOT NULL,
                                                    `used_count`            INT         NOT NULL,
                                                    `updated_at`            DATETIME    NOT NULL,
                                                    PRIMARY KEY (`cookie_daily_usage_id`),
                                                    UNIQUE KEY `uk_cookie_usage_member_date` (`member_id`, `use_date`),
                                                    KEY `idx_cookie_usage_member_date` (`member_id`, `use_date`),
                                                    CONSTRAINT `fk_cookie_usage_member`
                                                        FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                                            ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

ALTER TABLE game_attempt
    MODIFY fire_type VARCHAR(20) NOT NULL COMMENT 'ENUM(`WEAK`, `MEDIUM`, `STRONG`)';

ALTER TABLE fortune_cookie
    MODIFY status VARCHAR(50) NOT NULL
        COMMENT 'ENUM(`AVAILABLE`, `USED`, `DELETED`, `PENDING_GIFT`)';

/* ===============================================
   agzak MySQL DB update query 2.0.3 / 25.11.14
   =============================================== */
CREATE TABLE IF NOT EXISTS `gift` (
                         `gift_id`     BIGINT      NOT NULL AUTO_INCREMENT,
                         `sender_id`   BIGINT      NOT NULL,
                         `receiver_id` BIGINT      NOT NULL,
                         `cookie_id`   BIGINT      NOT NULL,
                         `message`     VARCHAR(255) NULL,
                         `status`      VARCHAR(255) NOT NULL COMMENT 'ENUM(`SENT`, `RECEIVED`)',
                         `sent_at`     DATETIME    NOT NULL,
                         `received_at` DATETIME    NULL,

                         PRIMARY KEY (`gift_id`),
                         KEY `IDX_gifts_sender`   (`sender_id`),
                         KEY `IDX_gifts_receiver` (`receiver_id`),
                         CONSTRAINT `FK_gifts_cookie`
                             FOREIGN KEY (`cookie_id`) REFERENCES `fortune_cookie`(`fortune_cookie_id`)
                                 ON DELETE CASCADE ON UPDATE CASCADE,
                         CONSTRAINT `FK_gifts_receiver`
                             FOREIGN KEY (`receiver_id`) REFERENCES `member`(`member_id`)
                                 ON DELETE CASCADE ON UPDATE CASCADE,
                         CONSTRAINT `FK_gifts_sender`
                             FOREIGN KEY (`sender_id`) REFERENCES `member`(`member_id`)
                                 ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* ===============================================
   agzak MySQL DB update query 2.1.0 / 25.11.14
   =============================================== */

-- 희귀도/쿠키종류 테이블 생성 + 시드 필요
CREATE TABLE `rarity` (
                          `rarity_id`   BIGINT      NOT NULL AUTO_INCREMENT,
                          `code`        VARCHAR(50) NOT NULL,  -- RARE|EPIC|UNIQUE
                          `name`        VARCHAR(50) NOT NULL,
                          `sort_order`  INT         NOT NULL,
                          PRIMARY KEY (`rarity_id`),
                          UNIQUE KEY `UQ_rarity_code` (`code`),
                          UNIQUE KEY `UQ_rarity_sort` (`sort_order`)
) ENGINE=InnoDB;

CREATE TABLE `cookie_kind` (
                               `cookie_kind_id` BIGINT      NOT NULL AUTO_INCREMENT,
                               `rarity_id`      BIGINT      NOT NULL,
                               `code`           VARCHAR(50) NOT NULL,  -- developer|santa|...
                               `name`           VARCHAR(50) NOT NULL,
                               `recipe`         VARCHAR(255) NULL,
                               `message`        VARCHAR(255) NULL,
                               `is_active`      TINYINT(1)  NOT NULL DEFAULT 1,
                               `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                               `updated_at` DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
                               PRIMARY KEY (`cookie_kind_id`),
                               UNIQUE KEY `UQ_cookie_kind_code` (`code`),
                               KEY `IDX_cookie_kind_rarity` (`rarity_id`),
                               CONSTRAINT `FK_cookie_kind_rarity`
                                   FOREIGN KEY (`rarity_id`) REFERENCES `rarity`(`rarity_id`)
                                       ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;



/* 2) fortune_cookie: type → cookie_kind_id 마이그레이션 */

/* 2-1) 신규 컬럼 추가 (이미 있으면 에러 1060 무시) */
ALTER TABLE fortune_cookie
    ADD COLUMN cookie_kind_id BIGINT NULL AFTER inventory_id;

/* 2-2) 인덱스 추가 (이미 있으면 에러 1061 무시) */
ALTER TABLE fortune_cookie
    ADD INDEX IDX_cookie_kind (cookie_kind_id);

SET SQL_SAFE_UPDATES = 0;
/* 2-3) 기존 type → cookie_kind_id 매핑 백필 (대소문자 혼재 대비 UPPER) */
UPDATE fortune_cookie fc
    JOIN cookie_kind ck
    ON ck.code = UPPER(fc.type)
SET fc.cookie_kind_id = ck.cookie_kind_id
WHERE fc.cookie_kind_id IS NULL
  AND fc.type IS NOT NULL;
SET SQL_SAFE_UPDATES = 1;

/* 2-4) FK 추가 전 누락 점검 */
SELECT COUNT(*) AS unmapped
FROM fortune_cookie
WHERE cookie_kind_id IS NULL;
/* ※ unmapped > 0 이면 매핑 누락값(type 오탈자 등) 먼저 정리 후 아래 진행 */

/* 2-5) FK 추가 (이미 있으면 에러 1826/1833는 무시) */
ALTER TABLE fortune_cookie
    ADD CONSTRAINT FK_cookie_kind
        FOREIGN KEY (cookie_kind_id) REFERENCES cookie_kind(cookie_kind_id)
            ON DELETE RESTRICT ON UPDATE CASCADE;

/* 2-6) NOT NULL 전환(기존 데이터 모두 매핑되었을 때만) */
ALTER TABLE fortune_cookie
    MODIFY cookie_kind_id BIGINT NOT NULL;

/* 2-7) 구 type 컬럼 제거 (없으면 에러 1091 무시) */
ALTER TABLE fortune_cookie
    DROP COLUMN type;


/* 3) collection: type → cookie_kind_id 마이그레이션
   (기존 schema에 type 컬럼이 있을 때만 수행하세요) */

/* 3-1) 신규 컬럼 추가 */
ALTER TABLE collection
    ADD COLUMN cookie_kind_id BIGINT NULL AFTER member_id;

/* 3-1b) 인덱스 추가 */
ALTER TABLE collection
    ADD INDEX IDX_collection_kind (cookie_kind_id);

/* 3-2) 데이터 백필 (type → cookie_kind.code) */
SET SQL_SAFE_UPDATES = 0;
UPDATE collection c
    JOIN cookie_kind ck
    ON ck.code = UPPER(c.type)
SET c.cookie_kind_id = ck.cookie_kind_id
WHERE c.cookie_kind_id IS NULL
  AND c.type IS NOT NULL;
SET SQL_SAFE_UPDATES = 1;

/* 3-3) 기존 UQ(member_id, type) 인덱스 제거 (없으면 1091 무시) */
ALTER TABLE collection
    DROP INDEX UQ_collection_member_type;

/* 3-3b) 새 UQ(member_id, cookie_kind_id) 생성 */
ALTER TABLE collection
    ADD UNIQUE INDEX UQ_collection_member_kind (member_id, cookie_kind_id);

/* 3-4) FK 추가 */
ALTER TABLE collection
    ADD CONSTRAINT FK_collection_kind
        FOREIGN KEY (cookie_kind_id) REFERENCES cookie_kind(cookie_kind_id)
            ON DELETE RESTRICT ON UPDATE CASCADE;

/* 3-5) NOT NULL 전환 */
ALTER TABLE collection
    MODIFY cookie_kind_id BIGINT NOT NULL;

/* 3-6) 구 컬럼 정리 (존재 시만 — 없으면 1091 무시)
   description을 유지하려면 첫 줄을 실행하지 마세요.
*/
ALTER TABLE collection
    DROP COLUMN description;

ALTER TABLE collection
    DROP COLUMN type;


/* 4) notifications 테이블 (없으면 생성) */
CREATE TABLE IF NOT EXISTS notification (
                                            notification_id BIGINT      NOT NULL AUTO_INCREMENT,
                                            member_id       BIGINT      NOT NULL,
                                            noti_type       VARCHAR(255) NOT NULL,
                                            ref_id          BIGINT      NOT NULL,
                                            message         VARCHAR(50)  NULL,
                                            created_at      DATETIME     NOT NULL,
                                            read_at         DATETIME     NULL,
                                            is_deleted      TINYINT(1)   NOT NULL DEFAULT 0,
                                            PRIMARY KEY (notification_id),
                                            CONSTRAINT FK_notification_member
                                                FOREIGN KEY (member_id) REFERENCES member(member_id)
                                                    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


/* 5) 검증 */
-- fortune_cookie 매핑 누락
SELECT COUNT(*) AS fortune_cookie_missing_kind
FROM fortune_cookie
WHERE cookie_kind_id IS NULL;

-- collection 매핑 누락
SELECT COUNT(*) AS collection_missing_kind
FROM collection
WHERE cookie_kind_id IS NULL;

-- 분포 확인
SELECT ck.code, COUNT(*) AS cnt
FROM fortune_cookie fc
         JOIN cookie_kind ck ON ck.cookie_kind_id = fc.cookie_kind_id
GROUP BY ck.code
ORDER BY cnt DESC;


ALTER TABLE collection
    ADD UNIQUE KEY UQ_collection_member_kind (member_id, cookie_kind_id);

/* 2) 모든 활성 회원 × 활성 쿠키종류 조합 생성 (없는 것만 삽입) */
INSERT INTO collection(member_id, cookie_kind_id, `count`, obtained_at)
SELECT m.member_id, ck.cookie_kind_id, 0, NULL
FROM member m
         JOIN cookie_kind ck ON ck.is_active = 1
         LEFT JOIN collection c
                   ON c.member_id = m.member_id AND c.cookie_kind_id = ck.cookie_kind_id
WHERE m.status = 'ACTIVE'
  AND c.collection_id IS NULL;

/* 3) 검증 */
SELECT COUNT(*) AS missing_after
FROM member m
         JOIN cookie_kind ck ON ck.is_active = 1
         LEFT JOIN collection c
                   ON c.member_id = m.member_id AND c.cookie_kind_id = ck.cookie_kind_id
WHERE m.status = 'ACTIVE'
  AND c.collection_id IS NULL;
