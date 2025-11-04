package com.ssafy.agzak.domain.fortune.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FortuneScoreResponse(@JsonProperty("total_score") int totalScore,
                                   @JsonProperty("love") int love,
                                   @JsonProperty("health") int health,
                                   @JsonProperty("money") int money,
                                   @JsonProperty("achievement") int achievement,
                                   @JsonProperty("total_summary") String totalSummary,
                                   @JsonProperty("detailed_summaries") DetailedSummaries detailedSummaries
) {}
