package com.ssafy.agzak.domain.fortune.dto.response;

import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;

public record FortuneAspectResponse(String name, int score, int original) {

    public static FortuneAspectResponse fromEntity(FortuneAspect fortuneAspect) {
        return new FortuneAspectResponse(fortuneAspect.getName().name(), fortuneAspect.getScore(), fortuneAspect.getOriginalScore());
    }
}
