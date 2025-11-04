package com.ssafy.agzak.domain.fortune.dto.response;

import com.ssafy.agzak.domain.fortune.entity.FortuneType;

public record FortuneTypeResponse(long id, String name, long goodWithId, long badWithId) {

    public static FortuneTypeResponse fromEntity(FortuneType fortuneType) {
        return new FortuneTypeResponse(
                fortuneType.getFortuneTypeId(),
                fortuneType.getName(),
                fortuneType.getGoodWith().getFortuneTypeId(),
                fortuneType.getBadWith().getFortuneTypeId()
        );
    }
}
