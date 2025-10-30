package com.ssafy.agzak.domain.fortune.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

public record GuestFortuneRequest(String gender, LocalDate birthDate, LocalTime birthTime, String birthCity) {
}
