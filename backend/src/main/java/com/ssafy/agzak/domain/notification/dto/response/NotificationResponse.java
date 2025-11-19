package com.ssafy.agzak.domain.notification.dto.response;

import com.ssafy.agzak.domain.notification.entity.NotiType;
import com.ssafy.agzak.domain.notification.entity.Notification;
import lombok.Builder;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long notificationId,
    NotiType notiType,
    Long referenceId,
    String message,
    LocalDateTime createdAt
) {

    @Builder
    public NotificationResponse {
    }

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .notiType(notification.getNotiType())
                .referenceId(notification.getRefId())
                .message(notification.getMessage())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
