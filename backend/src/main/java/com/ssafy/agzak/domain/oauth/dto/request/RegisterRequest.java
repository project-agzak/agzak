package com.ssafy.agzak.domain.oauth.dto.request;

import java.time.LocalDateTime;

public record RegisterRequest(String email, String password, String nickname,
                              String gender, LocalDateTime birthDate, String birthBranch, String birthCity) {
}
