package com.ssafy.agzak.domain.ranking.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDate;

@Builder
@Schema(description = "랭킹 응답 DTO")
public record RankingResponse(
        @Schema(description = "랭킹 순번", example = "1")
        int rankNo,
        @Schema(description = "회원 ID", example = "1001")
        Long memberId,
        @Schema(description = "닉네임", example = "lucky_guy")
        String nickname,
        @Schema(description = "총점", example = "132")
        int totalScore,
        @Schema(description = "날짜", example = "2025-10-27")
        LocalDate date
) {}
