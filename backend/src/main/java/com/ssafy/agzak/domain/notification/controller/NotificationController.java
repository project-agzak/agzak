package com.ssafy.agzak.domain.notification.controller;

import com.ssafy.agzak.docs.NotificationApiDocs;
import com.ssafy.agzak.domain.notification.dto.response.NotificationResponse;
import com.ssafy.agzak.domain.notification.service.NotificationService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
@Validated
public class NotificationController implements NotificationApiDocs {

    private final NotificationService notificationService;
    private final AuthMemberProvider authMemberProvider;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        return ResponseEntity.ok(
                notificationService.getNotifications(authMemberProvider.currentMemberId())
        );
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> readNotification(@PathVariable @Valid Long notificationId) {
        notificationService.markNotificationAsRead(notificationId, authMemberProvider.currentMemberId());
        return ResponseEntity.ok().build();
    }

}
