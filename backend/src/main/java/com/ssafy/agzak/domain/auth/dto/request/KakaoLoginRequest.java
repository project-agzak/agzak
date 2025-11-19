package com.ssafy.agzak.domain.auth.dto.request;

public record KakaoLoginRequest(
        String authCode,
        String redirectUri,
        String guestId
) {}
