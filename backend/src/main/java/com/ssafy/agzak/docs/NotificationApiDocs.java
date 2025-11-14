package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.notification.dto.response.NotificationResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "알림", description = "알림 관련 API 문서입니다.")
public interface NotificationApiDocs {

    @Operation(
            summary = "알림 조회",
            description = """
                사용자의 읽지 않은 알림 리스트를 반환합니다(READ/DELETED 제외).<br/>
                정렬: 최신 생성 순.
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = NotificationResponse.class)),
                            examples = @ExampleObject("""
                                [
                                  {
                                    "notificationId": 501,
                                    "type": "GIFT_RECEIVED",
                                    "refId": 3001,
                                    "message": "쿠키 선물이 도착했어요!",
                                    "createdAt": "2025-11-14T13:10:00"
                                  }
                                ]
                            """)))
    })
    ResponseEntity<List<NotificationResponse>> getNotifications();

    @Operation(
            summary = "알림 읽음 처리",
            description = """
                특정 알림을 읽음 처리합니다.<br/>
                • 성공 시: 상태 NEW → READ, readAt 기록<br/>
                • 제약: 본인 소유 알림만 처리 가능
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "읽음 처리 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 알림 ID",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject("""
                                { "code":"BAD_REQUEST", "message":"유효하지 않은 알림 아이디입니다." }
                            """))),
            @ApiResponse(responseCode = "403", description = "권한 없음(타인 알림)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "알림 미존재",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> readNotification(
            @Parameter(description = "알림 ID", example = "501")
            @PathVariable @Valid Long notificationId
    );
}
