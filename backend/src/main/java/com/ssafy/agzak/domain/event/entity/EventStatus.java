package com.ssafy.agzak.domain.event.entity;

public enum EventStatus {
    READY,   // 아직 시작 전
    OPEN,    // 참여 가능
    CLOSED,  // 종료
    PAUSED   // 일시 중단
}
