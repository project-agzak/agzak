package com.ssafy.agzak.global.error;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Schema(description = "표준 에러 응답")
public record ErrorResponse(
        @Schema(description = "에러 발생 시각(UTC)") OffsetDateTime timestamp,
        @Schema(description = "HTTP 상태 코드") int status,
        @Schema(description = "에러 코드") String code,
        @Schema(description = "사용자 표시용 메시지") String message,
        @Schema(description = "요청 경로") String path
) {
    public static ErrorResponse of(int status, String code, String message, String path) {
        return new ErrorResponse(OffsetDateTime.now(ZoneId.of("Asia/Seoul")), status, code, message, path);
    }
}
