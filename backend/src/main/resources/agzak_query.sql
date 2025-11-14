-- agzak MySQL DB update query 2.0.0 / 25.11.11

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
            CASE
                WHEN password IS NOT NULL AND status = 'ACTIVE' THEN email
                ELSE NULL
                END
            ) STORED;

-- 4) UNIQUE 인덱스 생성 (NULL은 중복 허용 → 소셜/탈퇴는 무제약)
CREATE UNIQUE INDEX UQ_member_email_local_active ON member (email_local_unique);

-- agzak MySQL DB update query 2.0.1 / 25.11.12

/* =========================================================
   8) 쿠키 도감 (Collection)
   ========================================================= */
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

-- agzak MySQL DB update query 2.0.2 / 25.11.13
/* =========================================================
   9) 하루 쿠키 사용 한도 (Daily Cookie Usage)
   ========================================================= */
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

-- agzak MySQL DB update query 2.0.3 / 25.11.13
ALTER TABLE game_attempt
    MODIFY fire_type VARCHAR(20) NOT NULL COMMENT 'ENUM(`WEAK`, `MEDIUM`, `STRONG`)';

/* =========================================================
   10) 선물 테이블
   ========================================================= */

CREATE TABLE gifts
(
    gift_id     BIGINT AUTO_INCREMENT NOT NULL,
    sender_id   BIGINT                NOT NULL,
    receiver_id BIGINT                NOT NULL,
    cookie_id   BIGINT                NOT NULL,
    message     VARCHAR(255)          NULL,
    status      VARCHAR(255)          NOT NULL,
    sent_at     datetime              NOT NULL,
    received_at datetime              NULL,
    CONSTRAINT pk_gifts PRIMARY KEY (gift_id)
);

ALTER TABLE gifts
    ADD CONSTRAINT FK_GIFTS_ON_COOKIE FOREIGN KEY (cookie_id) REFERENCES fortune_cookie (fortune_cookie_id);

ALTER TABLE gifts
    ADD CONSTRAINT FK_GIFTS_ON_RECEIVER FOREIGN KEY (receiver_id) REFERENCES member (member_id);

ALTER TABLE gifts
    ADD CONSTRAINT FK_GIFTS_ON_SENDER FOREIGN KEY (sender_id) REFERENCES member (member_id);