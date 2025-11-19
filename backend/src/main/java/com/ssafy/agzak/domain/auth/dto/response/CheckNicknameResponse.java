package com.ssafy.agzak.domain.auth.dto.response;

public record CheckNicknameResponse(
        String nickname,
        boolean available
) {}