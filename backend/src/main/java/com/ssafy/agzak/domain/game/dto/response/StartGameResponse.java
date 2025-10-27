package com.ssafy.agzak.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Schema(name = "StartGameResponse")
public record StartGameResponse(
        @Schema(description = "게임 세션 식별자", example = "7f5e9a9e-2d0c-4b5e-9a0f-0a2b3c4d5e6f")
        String gameSessionId,
        @Schema(description = "회원 ID", example = "1001")
        Long memberId,
        @Schema(description = "게임 날짜", example = "2025-10-27")
        LocalDate gameDate,
        @Schema(description = "회차 (1..3)", example = "1")
        Integer sessionNo,
        @Schema(description = "초기 성공 확률(%)", example = "70.00")
        BigDecimal initialSuccessProb,
        @Schema(description = "최대 시도 횟수", example = "10")
        Integer attemptsLimit,
        @Schema(description = "세션 상태", example = "IN_PROGRESS")
        SessionStatus status
) {
    public enum SessionStatus { IN_PROGRESS, COMPLETED, CANCELLED }
}
