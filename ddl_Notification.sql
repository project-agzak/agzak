CREATE TABLE notifications
(
    notification_id BIGINT AUTO_INCREMENT NOT NULL,
    member_id       BIGINT                NOT NULL,
    noti_type       VARCHAR(255)          NOT NULL,
    ref_id          BIGINT                NOT NULL,
    message         VARCHAR(50)           NOT NULL,
    created_at      datetime              NOT NULL,
    read_at         datetime              NULL,
    is_deleted      BIT(1)                NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (notification_id)
);

ALTER TABLE notifications
    ADD CONSTRAINT FK_NOTIFICATIONS_ON_MEMBER FOREIGN KEY (member_id) REFERENCES member (member_id);