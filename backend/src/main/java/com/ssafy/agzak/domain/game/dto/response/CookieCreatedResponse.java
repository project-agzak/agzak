package com.ssafy.agzak.domain.game.dto.response;

import lombok.Builder;

@Builder
public record CookieCreatedResponse(
        Long fortuneCookieId,
        Long inventoryId,
        Long gameSessionId,
        CookieTypeDto type,
        Integer love,
        Integer money,
        Integer achievement,
        Integer health,
        Integer total,
        String message
) {
    public enum CookieTypeDto { MONEY, LOVE, ACHIEVEMENT, HEALTH, MIXED, ROTTEN }
}
