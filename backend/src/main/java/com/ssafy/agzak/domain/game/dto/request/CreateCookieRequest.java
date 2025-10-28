package com.ssafy.agzak.domain.game.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "CreateCookieRequest")
public record CreateCookieRequest(
        Long memberId,
        Long inventoryId,
        Long gameSessionId,
        int snapLove,
        int snapMoney,
        int snapAchievement,
        int snapHealth
) {}
