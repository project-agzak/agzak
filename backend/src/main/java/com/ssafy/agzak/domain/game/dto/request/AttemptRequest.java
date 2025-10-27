package com.ssafy.agzak.domain.game.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(name = "AttemptRequest")
public record AttemptRequest(
        @Schema(description = "게임 세션 식별자")
        String gameSessionId,
        @Schema(description = "시도 번호 (1..10)", example = "1")
        Integer attemptNo,
        @Schema(description = "강화 항목")
        AspectName aspectName,
        @Schema(description = "굽기 방법")
        FireType fireType,
        @Schema(description = "기본 성공 확률(%)", example = "70.00")
        BigDecimal baseProb,
        @Schema(description = "현재 스냅샷 - 애정")
        Integer snapLove,
        @Schema(description = "현재 스냅샷 - 금전")
        Integer snapMoney,
        @Schema(description = "현재 스냅샷 - 성취")
        Integer snapAchievement,
        @Schema(description = "현재 스냅샷 - 건강")
        Integer snapHealth,
        @Schema(description = "결정적 모드(선택) - true면 applied>=50 기준으로 성공")
        Boolean deterministic
) {
    public enum AspectName { MONEY, LOVE, ACHIEVEMENT, HEALTH }
    public enum FireType { WEAK, STRONG }
}
