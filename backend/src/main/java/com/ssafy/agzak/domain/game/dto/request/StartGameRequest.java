package com.ssafy.agzak.domain.game.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(name = "StartGameRequest")
public record StartGameRequest(
        @Schema(description = "회원 ID", example = "1001")
        Long memberId,
        @Schema(description = "회차 (1..3)", example = "1")
        Integer sessionNo,
        @Schema(description = "게임 날짜(선택) - 기본 오늘", example = "2025-10-27")
        LocalDate gameDate
) {}
