package com.ssafy.agzak.dto.request;

import java.time.LocalDateTime;

public record OnboardingRequest(String nickname, String gender, LocalDateTime birthDate, String birthBranch, String birthCity) {
}
