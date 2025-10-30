package com.ssafy.agzak.domain.fortune.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

public record BirthDataInput(
        LocalDate birthDate,
        LocalTime birthTime,
        double latitude,
        double longitude
) {
}
