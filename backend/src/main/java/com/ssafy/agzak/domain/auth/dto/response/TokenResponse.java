package com.ssafy.agzak.domain.auth.dto.response;

public record TokenResponse(String accessToken, String refreshToken, long expiresInSeconds) {}
