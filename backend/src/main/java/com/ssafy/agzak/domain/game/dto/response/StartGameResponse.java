package com.ssafy.agzak.domain.game.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record StartGameResponse(
        Long gameSessionDbId,
        Long memberId,
        LocalDate gameDate,
        Integer sessionNo,
        BigDecimal initialSuccessProb,
        Integer attemptsLimit,
        SessionStatus status
) {
        public enum SessionStatus { IN_PROGRESS, COMPLETED, CANCELLED }
}
