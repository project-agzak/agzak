package com.ssafy.agzak.domain.notification.entity;

import lombok.Getter;

@Getter
public enum NotiType {
    GIFT_RECEIVED("선물이 도착했습니다!"),
    SYSTEM_NOTICE("시스템 알림입니다!");

    private final String message;

    NotiType(String message) {
        this.message = message;
    }
}
