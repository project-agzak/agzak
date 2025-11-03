package com.ssafy.agzak.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record KakaoLoginRequest(
        @NotBlank String accessToken,
        String guestId
) {}
