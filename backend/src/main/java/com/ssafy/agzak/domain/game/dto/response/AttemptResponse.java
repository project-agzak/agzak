package com.ssafy.agzak.domain.game.dto.response;

import com.ssafy.agzak.domain.game.dto.request.AttemptRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
@Schema(name = "AttemptResponse")
public record AttemptResponse(
        String gameSessionId,
        Integer attemptNo,
        AttemptRequest.AspectName aspectName,
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
        Integer snapHealth
) {}
