package com.ssafy.agzak.domain.fortune.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FortuneScoreResponse(@JsonProperty("total_score") int totalScore,
                                   @JsonProperty("romance_score") int romanceScore,
                                   @JsonProperty("health_score") int healthScore,
                                   @JsonProperty("wealth_score") int wealthScore,
                                   @JsonProperty("achievement_score") int achievementScore,
                                   @JsonProperty("total_summary") String totalSummary,
                                   @JsonProperty("detailed_summaries") DetailedSummaries detailedSummaries
) {}
