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
        SessionStatus status,

        // === 재개(Resume)용 진행상태 ===
        Integer nextAttemptNo,         // 다음 시도 번호(1..10)
        BigDecimal currentBaseProb,
        Integer snapLove,
        Integer snapMoney,
        Integer snapAchievement,
        Integer snapHealth,
        Integer snapMisfortune
) {
        public enum SessionStatus { IN_PROGRESS, COMPLETED, CANCELLED }
}
