package com.ssafy.agzak.domain.fortune.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FortuneScoreResponse(@JsonProperty("total_score") int totalScore,
                                   @JsonProperty("romance") int romance,
                                   @JsonProperty("health") int health,
                                   @JsonProperty("wealth") int wealth,
                                   @JsonProperty("achievement") int achievement,
                                   @JsonProperty("total_summary") String totalSummary,
                                   @JsonProperty("detailed_summaries") DetailedSummaries detailedSummaries
) {}
