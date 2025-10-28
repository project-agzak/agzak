package com.ssafy.agzak.dto.response;

import java.util.List;

public record DetailFortuneDataResponse(long fortuneId, String description, int totalScore,
                                        int originalTotalScore, FortuneTypeResponse fortuneType,
                                        List<FortuneAspectResponse> fortuneAspects) {
}