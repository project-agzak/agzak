package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.notification.dto.response.NotificationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "알림 API", description = "알림 관련 API 문서입니다.")
public interface NotificationApiDocs {

    @Operation(summary = "알림 조회", description = "사용자의 알림 목록을 조회합니다.")
    public ResponseEntity<List<NotificationResponse>> getNotifications();

    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 처리합니다.")
    public ResponseEntity<Void> readNotification(@PathVariable @Valid Long notificationId);
}
