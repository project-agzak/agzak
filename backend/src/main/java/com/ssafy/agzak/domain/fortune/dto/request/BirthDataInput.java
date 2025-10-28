package com.ssafy.agzak.domain.fortune.dto.request;

import java.time.LocalDateTime;

public record BirthDataInput(
        LocalDateTime birthDateTime,
        String birthTimeZone,
        double latitude,
        double longitude
) {
}
