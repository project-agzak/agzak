package com.ssafy.agzak.domain.game.dto.response;

import java.math.BigDecimal;

public record AdviceResponse(
        BigDecimal baseProb,
        FirePick firePick,
        String tip
) {
    public enum FirePick { WEAK, STRONG }
}
