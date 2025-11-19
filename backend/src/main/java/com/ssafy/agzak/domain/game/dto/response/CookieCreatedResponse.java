package com.ssafy.agzak.domain.game.dto.response;

import lombok.Builder;

@Builder
public record CookieCreatedResponse(
        Long fortuneCookieId,
        Long inventoryId,
        Long gameSessionId,
        Long cookieKindId,
        String code,
        String name,
        String rarityCode,
        String recipe,
        String message,
        int love,
        int money,
        int achievement,
        int health,
        int total
) {}
