package com.ssafy.agzak.domain.fortune.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DetailedSummaries(
        @JsonProperty("romance") String romance,
        @JsonProperty("health") String health,
        @JsonProperty("wealth") String wealth,
        @JsonProperty("achievement") String achievement
) {
}
