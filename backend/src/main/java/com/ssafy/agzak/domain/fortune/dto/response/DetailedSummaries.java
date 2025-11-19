package com.ssafy.agzak.domain.fortune.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DetailedSummaries(
        @JsonProperty("love") String love,
        @JsonProperty("health") String health,
        @JsonProperty("money") String money,
        @JsonProperty("achievement") String achievement
) {
}
