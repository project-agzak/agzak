/* =========================================================
   0) DB 생성
   ========================================================= */
DROP DATABASE IF EXISTS `agzak`;
CREATE DATABASE `agzak` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `agzak`;

/* =========================================================
   1) 회원 / 인증
   ========================================================= */
CREATE TABLE `member` (
                          `member_id`  BIGINT       NOT NULL AUTO_INCREMENT,
                          `nickname`   VARCHAR(50)  NOT NULL,
                          `email`      VARCHAR(255) NULL,
                          `password`   VARCHAR(255) NULL,
                          `gender`     VARCHAR(50)  NOT NULL,
                          `birth_date` DATE         NOT NULL COMMENT 'YYYY-MM-DD',
                          `birth_time` TIME         NOT NULL DEFAULT '00:00:00' COMMENT '태어난 시:분 (:초는 00)',
                          `birth_city` VARCHAR(100) NULL,
                          `latitude`   DOUBLE       NULL COMMENT '위도(y)',
                          `longitude`  DOUBLE       NULL COMMENT '경도(x)',
                          `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                          `updated_at` DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
                          `status`     VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ENUM(`ACTIVE`, `WITHDRAWN`)',
                          `email_local_unique` VARCHAR(255)
                              GENERATED ALWAYS AS (
                                  IF(`password` IS NOT NULL AND `status` = 'ACTIVE', `email`, NULL)
                                  ) STORED,
                          PRIMARY KEY (`member_id`),
                          UNIQUE KEY `UQ_member_nickname` (`nickname`),
                          UNIQUE KEY `UQ_member_email_local_active` (`email_local_unique`)
) ENGINE=InnoDB;

CREATE TABLE `oauth_identity` (
                                  `member_id` BIGINT       NOT NULL,
                                  `provider`  VARCHAR(50)  NOT NULL COMMENT 'ENUM(`KAKAO`, `NAVER`, `GOOGLE`)',
                                  `sub`       VARCHAR(255) NOT NULL,
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
                                `good_with_id`    BIGINT      NULL,
                                `bad_with_id`     BIGINT      NULL,
                                PRIMARY KEY (`fortune_type_id`),
                                KEY `IDX_fortune_type_good_with` (`good_with_id`),
                                KEY `IDX_fortune_type_bad_with`  (`bad_with_id`),
                                CONSTRAINT `FK_fortune_type_good_with`
                                    FOREIGN KEY (`good_with_id`) REFERENCES `fortune_type`(`fortune_type_id`)
                                        ON DELETE SET NULL ON UPDATE CASCADE,
                                CONSTRAINT `FK_fortune_type_bad_with`
                                    FOREIGN KEY (`bad_with_id`) REFERENCES `fortune_type`(`fortune_type_id`)
                                        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   3) 운세 결과 / 세부
   ========================================================= */
CREATE TABLE `fortune` (
                           `fortune_id`           BIGINT       NOT NULL AUTO_INCREMENT,
                           `member_id`            BIGINT       NOT NULL,
                           `fortune_type_id`      BIGINT       NOT NULL,
                           `date`                 DATE         NOT NULL,
                           `description`          VARCHAR(1000) NULL,
                           `total_score`          INT          NOT NULL,
                           `original_total_score` INT          NOT NULL,
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

CREATE TABLE `fortune_aspect` (
                                  `fortune_aspect_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                  `fortune_id`        BIGINT      NOT NULL,
                                  `name`              VARCHAR(50) NOT NULL COMMENT 'ENUM(`MONEY`, `LOVE`, `ACHIEVEMENT`, `HEALTH`)',
                                  `score`             INT         NOT NULL,
                                  `original_score`    INT         NOT NULL,
                                  `description`       VARCHAR(1000) NULL,
                                  PRIMARY KEY (`fortune_aspect_id`),
                                  UNIQUE KEY `UQ_aspect_per_fortune` (`fortune_id`, `name`),
                                  CONSTRAINT `FK_aspect_fortune`
                                      FOREIGN KEY (`fortune_id`) REFERENCES `fortune`(`fortune_id`)
                                          ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   4) 희귀도 / 쿠키종류
   ========================================================= */
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

/* =========================================================
   5) 인벤토리 / 게임 / 쿠키
   ========================================================= */
CREATE TABLE `inventory` (
                             `inventory_id` BIGINT NOT NULL AUTO_INCREMENT,
                             `member_id`    BIGINT NOT NULL,
                             PRIMARY KEY (`inventory_id`),
                             UNIQUE KEY `UQ_inventory_member` (`member_id`),
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
                                `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                                `updated_at` DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
                                PRIMARY KEY (`game_session_id`),
                                UNIQUE KEY `UQ_game_day_quota` (`member_id`, `game_date`, `session_no`),
                                CONSTRAINT `CK_session_no_range` CHECK (`session_no` BETWEEN 1 AND 10),
                                CONSTRAINT `FK_game_session_member`
                                    FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `fortune_cookie` (
                                  `fortune_cookie_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                  `inventory_id`      BIGINT      NOT NULL,
                                  `cookie_kind_id`    BIGINT      NOT NULL,
                                  `game_session_id`   BIGINT      NULL,
                                  `love`              INT         NOT NULL,
                                  `money`             INT         NOT NULL,
                                  `achievement`       INT         NOT NULL,
                                  `health`            INT         NOT NULL,
                                  `status`            VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' COMMENT 'ENUM(`AVAILABLE`, `USED`, `DELETED`, `PENDING_GIFT`)',
                                  `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                                  PRIMARY KEY (`fortune_cookie_id`),
                                  KEY `IDX_cookie_inventory` (`inventory_id`),
                                  KEY `IDX_cookie_kind` (`cookie_kind_id`),
                                  UNIQUE KEY `UQ_cookie_session` (`game_session_id`),
                                  CONSTRAINT `FK_cookie_inventory`
                                      FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`inventory_id`)
                                          ON DELETE CASCADE ON UPDATE CASCADE,
                                  CONSTRAINT `FK_cookie_session`
                                      FOREIGN KEY (`game_session_id`) REFERENCES `game_session`(`game_session_id`)
                                          ON DELETE SET NULL ON UPDATE CASCADE,
                                  CONSTRAINT `FK_cookie_kind`
                                      FOREIGN KEY (`cookie_kind_id`) REFERENCES `cookie_kind`(`cookie_kind_id`)
                                          ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   6) 랭킹 / 시도 로그 / 일일한도
   ========================================================= */
CREATE TABLE `ranking` (
                           `ranking_id`           BIGINT   NOT NULL AUTO_INCREMENT,
                           `member_id`            BIGINT   NOT NULL,
                           `date`                 DATE     NOT NULL,
                           `rank_no`              INT      NOT NULL,
                           `total_score`          INT      NOT NULL,
                           `original_total_score` INT      NOT NULL,
                           `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                           `updated_at` DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
                           PRIMARY KEY (`ranking_id`),
                           UNIQUE KEY `UQ_ranking_member_date` (`member_id`, `date`),
                           KEY `IDX_ranking_date_rank` (`date`, `rank_no`),
                           CONSTRAINT `FK_ranking_member`
                               FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `game_attempt` (
                                `game_attempt_id`  BIGINT      NOT NULL AUTO_INCREMENT,
                                `game_session_id`  BIGINT      NOT NULL,
                                `attempt_no`       INT         NOT NULL,
                                `aspect_name`      VARCHAR(20) NOT NULL COMMENT 'ENUM(`MONEY`, `LOVE`, `ACHIEVEMENT`, `HEALTH`, `MISFORTUNE`)',
                                `fire_type`        VARCHAR(20) NOT NULL COMMENT 'ENUM(`WEAK`, `MEDIUM`, `STRONG`)',
                                `base_prob`        DECIMAL(5,2) NOT NULL,
                                `adjustment_pp`    DECIMAL(5,2) NOT NULL,
                                `applied_prob`     DECIMAL(5,2) NOT NULL,
                                `is_success`       TINYINT(1)   NOT NULL,
                                `delta_value`      INT          NOT NULL,
                                `next_base_prob`   DECIMAL(5,2) NOT NULL,
                                `snap_love`        INT          NOT NULL,
                                `snap_money`       INT          NOT NULL,
                                `snap_achievement` INT          NOT NULL,
                                `snap_health`      INT          NOT NULL,
                                `snap_misfortune`  INT          NOT NULL,
                                `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                                PRIMARY KEY (`game_attempt_id`),
                                UNIQUE KEY `UQ_attempt_order` (`game_session_id`, `attempt_no`),
                                CONSTRAINT `CK_attempt_no_range` CHECK (`attempt_no` BETWEEN 1 AND 10),
                                CONSTRAINT `FK_attempt_session`
                                    FOREIGN KEY (`game_session_id`) REFERENCES `game_session`(`game_session_id`)
                                        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `cookie_daily_usage` (
                                      `cookie_daily_usage_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                      `member_id`             BIGINT      NOT NULL,
                                      `use_date`              DATE        NOT NULL,
                                      `used_count`            INT         NOT NULL,
                                      `updated_at` DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
                                      PRIMARY KEY (`cookie_daily_usage_id`),
                                      UNIQUE KEY `uk_cookie_usage_member_date` (`member_id`, `use_date`),
                                      KEY `idx_cookie_usage_member_date` (`member_id`, `use_date`),
                                      CONSTRAINT `fk_cookie_usage_member`
                                          FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                              ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   7) 도감
   ========================================================= */
CREATE TABLE `collection` (
                              `collection_id` BIGINT      NOT NULL AUTO_INCREMENT,
                              `member_id`     BIGINT      NOT NULL,
                              `cookie_kind_id` BIGINT     NOT NULL,
                              `count`         INT         NOT NULL DEFAULT 0,
                              `obtained_at`   DATETIME    NULL,
                              PRIMARY KEY (`collection_id`),
                              UNIQUE KEY `UQ_collection_member_kind` (`member_id`, `cookie_kind_id`),
                              KEY `IDX_collection_member` (`member_id`),
                              CONSTRAINT `FK_collection_member`
                                  FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                      ON DELETE CASCADE ON UPDATE CASCADE,
                              CONSTRAINT `FK_collection_kind`
                                  FOREIGN KEY (`cookie_kind_id`) REFERENCES `cookie_kind`(`cookie_kind_id`)
                                      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   8) 선물
   ========================================================= */
CREATE TABLE `gifts` (
                         `gift_id`     BIGINT      NOT NULL AUTO_INCREMENT,
                         `sender_id`   BIGINT      NOT NULL,
                         `receiver_id` BIGINT      NOT NULL,
                         `cookie_id`   BIGINT      NOT NULL,
                         `message`     VARCHAR(255) NULL,
                         `status`      VARCHAR(255) NOT NULL COMMENT 'ENUM(`PENDING`, `SENT`, `RECEIVED`, `CANCELLED`)',
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

/* =========================================================
   9) 알림
   ========================================================= */
CREATE TABLE `notification` (
                                `notification_id` BIGINT      NOT NULL AUTO_INCREMENT,
                                `member_id`       BIGINT      NOT NULL,
                                `noti_type`       VARCHAR(255) NOT NULL,
                                `ref_id`          BIGINT      NOT NULL,
                                `message`         VARCHAR(50) NULL,
                                `created_at` DATETIME     NOT NULL DEFAULT NOW(),
                                `read_at`         DATETIME    NULL,
                                `is_deleted`      TINYINT(1)  NOT NULL,
                                PRIMARY KEY (`notification_id`),
                                CONSTRAINT `FK_notification_member`
                                    FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
                                        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
