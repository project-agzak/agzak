/* =========================================================
   0) DB 생성/교체
   ========================================================= */
DROP DATABASE IF EXISTS `agzak`;
CREATE DATABASE `agzak` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `agzak`;

/* =========================================================
   1) 회원 / 인증
   ========================================================= */
CREATE TABLE `member` (
                          `member_id`     BIGINT       NOT NULL AUTO_INCREMENT,
                          `nickname`      VARCHAR(50)  NOT NULL,
                          `email`         VARCHAR(255) NULL,
                          `password`      VARCHAR(255) NULL,
                          `gender`        VARCHAR(50)  NOT NULL,
                          `birth_date`    DATE         NOT NULL COMMENT 'YYYY-MM-DD',
                          `birth_branch`  VARCHAR(50)  NULL COMMENT 'ENUM(`RAT`, `OX`, `TIGER`, `RABBIT`, `DRAGON`, `SNAKE`, `HORSE`, `SHEEP`, `MONKEY`, `ROOSTER`, `DOG`, `PIG`)',
                          `birth_city`    VARCHAR(100) NULL,
                          `created_at`    DATETIME     NOT NULL,
                          `updated_at`    DATETIME     NOT NULL,
                          `status`        VARCHAR(50)  NULL COMMENT 'ENUM(`ACTIVE`, `WITHDRAWN`)',
                          PRIMARY KEY (`member_id`),
                          UNIQUE KEY `UQ_member_nickname` (`nickname`),
                          UNIQUE KEY `UQ_member_email` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `oauth_identity` (
                                  `member_id` BIGINT       NOT NULL,
                                  `provider`  VARCHAR(50)  NOT NULL COMMENT 'ENUM(`KAKAO`, `NAVER`, `GOOGLE`)',
                                  `sub`       VARCHAR(255) NOT NULL,
    /* 한 provider 내에서 sub 유일,
       한 member는 같은 provider로 중복 연결 불가 */
                                  PRIMARY KEY (`provider`, `sub`),
                                  UNIQUE KEY `UQ_member_provider` (`member_id`, `provider`),
                                  CONSTRAINT `FK_oauth_member`
                                      FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                          ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   2) 운세 타입
   ========================================================= */
CREATE TABLE `fortune_type` (
                                `fortune_type_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                `name`            VARCHAR(50) NOT NULL,
                                `description`     VARCHAR(255) NULL,
                                `good_with_id`    BIGINT       NULL,
                                `bad_with_id`     BIGINT       NULL,
                                PRIMARY KEY (`fortune_type_id`),
                                KEY `IDX_fortune_type_good_with` (`good_with_id`),
                                KEY `IDX_fortune_type_bad_with`  (`bad_with_id`),

                                CONSTRAINT `FK_fortune_type_good_with`
                                    FOREIGN KEY (`good_with_id`)
                                        REFERENCES `fortune_type`(`fortune_type_id`)
                                        ON DELETE SET NULL ON UPDATE CASCADE,

                                CONSTRAINT `FK_fortune_type_bad_with`
                                    FOREIGN KEY (`bad_with_id`)
                                        REFERENCES `fortune_type`(`fortune_type_id`)
                                        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   3) 운세 결과 (일자별 총점/타입)
   ========================================================= */
CREATE TABLE `fortune` (
                           `fortune_id`      BIGINT       NOT NULL AUTO_INCREMENT,
                           `member_id`       BIGINT       NOT NULL,
                           `fortune_type_id` BIGINT       NOT NULL,
                           `date`            DATE         NOT NULL,
                           `description`     VARCHAR(1000) NULL,
                           `total_score`     INT          NOT NULL,
                           `original_total_score` INT       NOT NULL,
                           PRIMARY KEY (`fortune_id`),
                           UNIQUE KEY `UQ_fortune_member_date` (`member_id`, `date`),
                           KEY `IDX_fortune_date_score` (`date`, `total_score`),
                           CONSTRAINT `FK_fortune_member`
                               FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                   ON DELETE CASCADE ON UPDATE CASCADE,
                           CONSTRAINT `FK_fortune_type`
                               FOREIGN KEY (`fortune_type_id`) REFERENCES `fortune_type`(`fortune_type_id`)
                                   ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   4) 운세 세부 항목 점수
   ========================================================= */
CREATE TABLE `fortune_aspect` (
                                  `fortune_aspect_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                  `fortune_id`        BIGINT      NOT NULL,
                                  `name`              VARCHAR(50) NOT NULL COMMENT 'ENUM(`MONEY`, `LOVE`, `ACHIEVEMENT`, `HEALTH`)',
                                  `score`             INT         NOT NULL,
                                  `original_score`    INT         NOT NULL,
                                  PRIMARY KEY (`fortune_aspect_id`),
                                  UNIQUE KEY `UQ_aspect_per_fortune` (`fortune_id`, `name`),
                                  CONSTRAINT `FK_aspect_fortune`
                                      FOREIGN KEY (`fortune_id`) REFERENCES `fortune`(`fortune_id`)
                                          ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   5) 인벤토리 & 포춘쿠키
   ========================================================= */
CREATE TABLE `inventory` (
                             `inventory_id` BIGINT NOT NULL AUTO_INCREMENT,
                             `member_id`    BIGINT NOT NULL,
                             PRIMARY KEY (`inventory_id`),
    /* 멤버별 인벤토리 식별 인덱스(조회 용도) */
                             UNIQUE KEY `UQ_inventory_member` (`member_id`, `inventory_id`),
                             CONSTRAINT `FK_inventory_member`
                                 FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                     ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `game_session` (
                                `game_session_id`      BIGINT      NOT NULL AUTO_INCREMENT,
                                `member_id`            BIGINT      NOT NULL,
                                `game_date`            DATE        NOT NULL COMMENT 'Asia/Seoul 기준',
                                `session_no`           INT         NOT NULL,
                                `status`               VARCHAR(50) NOT NULL COMMENT 'ENUM(`IN_PROGRESS`, `COMPLETED`, `CANCELLED`)',
                                `initial_success_prob` DECIMAL(5,2) NOT NULL DEFAULT 70.00,
                                `attempts_limit`       INT         NOT NULL DEFAULT 10,
                                `created_at`           DATETIME    NOT NULL,
                                `updated_at`           DATETIME    NOT NULL,
                                PRIMARY KEY (`game_session_id`),
                                UNIQUE KEY `UQ_game_day_quota` (`member_id`, `game_date`, `session_no`),
                                CONSTRAINT `CK_session_no_range` CHECK (`session_no` BETWEEN 1 AND 3),
                                CONSTRAINT `FK_game_session_member`
                                    FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* 쿠키는 인벤토리에 종속. 세션 산출 추적이 필요하면 역방향 링크(Nullable) 사용 */
CREATE TABLE `fortune_cookie` (
                                  `fortune_cookie_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                  `inventory_id`      BIGINT      NOT NULL,
                                  `game_session_id`   BIGINT      NULL, /* 선택적 역방향 링크: 세션 산출물 추적용 */
                                  `type`              VARCHAR(50) NULL COMMENT 'ENUM(`MONEY`, `LOVE`, `ACHIEVEMENT`, `HEALTH`, `MIXED`, `ROTTEN`)',
                                  `love`              INT         NOT NULL,
                                  `money`             INT         NOT NULL,
                                  `achievement`       INT         NOT NULL,
                                  `health`            INT         NOT NULL,
                                  `status`            VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' COMMENT 'ENUM(`AVAILABLE`, `USED`)',
                                  `created_at`    DATETIME     NOT NULL,
                                  PRIMARY KEY (`fortune_cookie_id`),
                                  KEY `IDX_cookie_inventory` (`inventory_id`),
                                  UNIQUE KEY `UQ_cookie_session` (`game_session_id`),
                                  CONSTRAINT `FK_cookie_inventory`
                                      FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`inventory_id`)
                                          ON DELETE CASCADE ON UPDATE CASCADE,
                                  CONSTRAINT `FK_cookie_session`
                                      FOREIGN KEY (`game_session_id`) REFERENCES `game_session`(`game_session_id`)
                                          ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   6) 랭킹 (일자별 스냅샷)
   ========================================================= */
CREATE TABLE `ranking` (
                           `ranking_id`  BIGINT   NOT NULL AUTO_INCREMENT,
                           `member_id`   BIGINT   NOT NULL,
                           `date`        DATE     NOT NULL,
                           `rank_no`     INT      NOT NULL,
                           `total_score` INT      NOT NULL,
                           `created_at`  DATETIME NOT NULL,
                           `updated_at`  DATETIME NOT NULL,
                           PRIMARY KEY (`ranking_id`),
                           UNIQUE KEY `UQ_ranking_member_date` (`member_id`, `date`),
                           KEY `IDX_ranking_date_rank` (`date`, `rank_no`),
                           CONSTRAINT `FK_ranking_member`
                               FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   7) 게임 시도(강화) 로그
   ========================================================= */
CREATE TABLE `game_attempt` (
                                `game_attempt_id`  BIGINT      NOT NULL AUTO_INCREMENT,
                                `game_session_id`  BIGINT      NOT NULL,
                                `attempt_no`       INT         NOT NULL,  -- 1..10
                                `aspect_name`      VARCHAR(20) NOT NULL COMMENT 'ENUM(`MONEY`, `LOVE`, `ACHIEVEMENT`, `HEALTH`)',
                                `fire_type`        VARCHAR(20) NOT NULL COMMENT 'ENUM(`WEAK`, `STRONG`)',

    /* 확률 기록 */
                                `base_prob`        DECIMAL(5,2) NOT NULL,  -- 직전 기본성공확률
                                `adjustment_pp`    DECIMAL(5,2) NOT NULL,  -- 약한불 +5 / 강한불 -5 (pp)
                                `applied_prob`     DECIMAL(5,2) NOT NULL,  -- base + adjustment

    /* 결과 */
                                `is_success`       TINYINT(1)   NOT NULL,
                                `delta_value`      INT          NOT NULL,  -- 성공/실패 증감치
                                `next_base_prob`   DECIMAL(5,2) NOT NULL,  -- 다음 기본성공확률

    /* 누적 스냅샷 */
                                `snap_love`        INT          NOT NULL,
                                `snap_money`       INT          NOT NULL,
                                `snap_achievement` INT          NOT NULL,
                                `snap_health`      INT          NOT NULL,
                                `snap_misfortune`  INT          NOT NULL,

                                `created_at`       DATETIME     NOT NULL,

                                PRIMARY KEY (`game_attempt_id`),
                                UNIQUE KEY `UQ_attempt_order` (`game_session_id`, `attempt_no`),
                                CONSTRAINT `CK_attempt_no_range` CHECK (`attempt_no` BETWEEN 1 AND 10),
                                CONSTRAINT `FK_attempt_session`
                                    FOREIGN KEY (`game_session_id`) REFERENCES `game_session`(`game_session_id`)
                                        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
