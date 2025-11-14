package com.ssafy.agzak.domain.notification.entity;

public enum NotiType {
    GIFT_RECEIVED("선물이 도착했습니다!");

    private String message;

    NotiType(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
