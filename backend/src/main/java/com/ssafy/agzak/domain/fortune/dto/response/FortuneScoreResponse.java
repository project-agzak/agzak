package com.ssafy.agzak.domain.fortune.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;

import java.util.List;

public record FortuneScoreResponse(@JsonProperty("total_score") int totalScore,
                                   @JsonProperty("love") int love,
                                   @JsonProperty("health") int health,
                                   @JsonProperty("money") int money,
                                   @JsonProperty("achievement") int achievement,
                                   @JsonProperty("total_summary") String totalSummary,
                                   @JsonProperty("detailed_summaries") DetailedSummaries detailedSummaries
) {
    public static FortuneScoreResponse fromEntity(Fortune fortune, List<FortuneAspect> fortuneAspects) {
        FortuneAspect love = fortuneAspects.stream().filter(fortuneAspect -> fortuneAspect.getName()
                        .equals(FortuneAspect.AspectName.LOVE)).toList()
                .get(0);

        FortuneAspect health = fortuneAspects.stream().filter(fortuneAspect -> fortuneAspect.getName()
                        .equals(FortuneAspect.AspectName.HEALTH)).toList()
                .get(0);

        FortuneAspect money = fortuneAspects.stream().filter(fortuneAspect -> fortuneAspect.getName()
                        .equals(FortuneAspect.AspectName.MONEY)).toList()
                .get(0);

        FortuneAspect achievement = fortuneAspects.stream().filter(fortuneAspect -> fortuneAspect.getName()
                        .equals(FortuneAspect.AspectName.ACHIEVEMENT)).toList()
                .get(0);

        DetailedSummaries detailed = new DetailedSummaries(love.getDescription(), health.getDescription(), money.getDescription(), achievement.getDescription());
        return new FortuneScoreResponse(fortune.getTotalScore(),
                love.getOriginalScore(),
                health.getOriginalScore(),
                money.getOriginalScore(),
                achievement.getOriginalScore(),
                fortune.getDescription(), detailed);
    }
}
