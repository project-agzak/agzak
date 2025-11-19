package com.ssafy.agzak.domain.fortune.dto.response;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;

import java.util.List;

public record FinalFortuneResponse(FortuneScoreResponse scores,
                                   FortuneTypeResponse type) {

    public static FinalFortuneResponse fromEntity(Fortune fortune, List<FortuneAspect> aspectList) {
        return new FinalFortuneResponse(
                FortuneScoreResponse.fromEntity(fortune, aspectList),
                FortuneTypeResponse.fromEntity(fortune.getFortuneType()));
    }
}
