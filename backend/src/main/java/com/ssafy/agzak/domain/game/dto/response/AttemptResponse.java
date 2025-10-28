package com.ssafy.agzak.domain.game.dto.response;

import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record AttemptResponse(
        Long gameSessionId,
        Integer attemptNo,
        AttemptRequest.AttemptAspect aspectName,
        AttemptRequest.FireType fireType,
        BigDecimal baseProb,
        BigDecimal adjustmentPp,
        BigDecimal appliedProb,
        Boolean success,
        Integer deltaValue,
        BigDecimal nextBaseProb,
        Integer snapLove,
        Integer snapMoney,
        Integer snapAchievement,
        Integer snapHealth,
        Integer snapMisfortune
) {}
