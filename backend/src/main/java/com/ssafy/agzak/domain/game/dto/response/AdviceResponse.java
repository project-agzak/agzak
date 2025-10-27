package com.ssafy.agzak.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(name = "AdviceResponse")
public record AdviceResponse(
        @Schema(description = "현재 기본성공확률(%)", example = "70.00")
        BigDecimal baseProb,
        @Schema(description = "추천 굽기 방법")
        FirePick firePick,
        @Schema(description = "설명")
        String tip
) {
    public enum FirePick { WEAK, STRONG }
}