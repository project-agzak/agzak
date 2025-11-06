package com.ssafy.agzak.domain.game.dto.response;

public record TodayQuotaResponse(
        int cap,
        long used,
        int remaining,
        int maxCap,
        int unlockable
) { }
