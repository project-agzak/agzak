package com.ssafy.agzak.domain.fortune.dto.request;

import java.time.LocalDateTime;

public record GuestFortuneRequest(String gender, LocalDateTime birthDate, String birthHour, String birthCity) {
}
