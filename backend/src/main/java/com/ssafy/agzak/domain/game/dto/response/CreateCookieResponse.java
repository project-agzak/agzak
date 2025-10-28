package com.ssafy.agzak.domain.game.dto.response;

import lombok.Builder;

@Builder
public record CreateCookieResponse(
        Long cookieDbId,
        Long memberId,
        Long inventoryId,
        Long gameSessionId,
        CookieTypeDto type,
        int love,
        int money,
        int achievement,
        int health,
        int total,
        String message
) {
    public enum CookieTypeDto { MONEY, LOVE, ACHIEVEMENT, HEALTH, MIXED, ROTTEN }
}
