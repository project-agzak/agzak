package com.ssafy.agzak.domain.game.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "CreateCookieRequest", description = "게임 종료 시 쿠키 생성 요청 DTO")
public record CreateCookieRequest(
        @Schema(description = "회원 ID", example = "1001")
        Long memberId,

        @Schema(description = "인벤토리 ID (이미 존재하는 인벤토리에 추가)", example = "2001")
        Long inventoryId,

        @Schema(description = "게임 세션 ID (선택)", example = "session-uuid-or-id")
        String gameSessionId,

        @Schema(description = "애정 스냅샷", example = "12")
        int snapLove,

        @Schema(description = "금전 스냅샷", example = "8")
        int snapMoney,

        @Schema(description = "성취 스냅샷", example = "6")
        int snapAchievement,

        @Schema(description = "건강 스냅샷", example = "5")
        int snapHealth
) {}
