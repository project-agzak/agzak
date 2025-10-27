package com.ssafy.agzak.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(name = "CreateCookieResponse", description = "생성된 쿠키 정보")
public record CreateCookieResponse(
        @Schema(description = "쿠키 식별자 (임시 UUID)", example = "uuid-1234")
        String cookieId,

        @Schema(description = "회원 ID", example = "1001")
        Long memberId,

        @Schema(description = "인벤토리 ID", example = "2001")
        Long inventoryId,

        @Schema(description = "생성된 게임 세션 ID(있다면)", example = "session-uuid")
        String gameSessionId,

        @Schema(description = "쿠키 타입")
        CookieTypeDto type,

        @Schema(description = "애정 수치", example = "12")
        int love,

        @Schema(description = "금전 수치", example = "8")
        int money,

        @Schema(description = "성취 수치", example = "6")
        int achievement,

        @Schema(description = "건강 수치", example = "5")
        int health,

        @Schema(description = "모든 능력치 합계", example = "31")
        int total,

        @Schema(description = "설명 메시지")
        String message
) {
    public enum CookieTypeDto {
        MONEY, LOVE, ACHIEVEMENT, HEALTH, MIXED, ROTTEN
    }
}
