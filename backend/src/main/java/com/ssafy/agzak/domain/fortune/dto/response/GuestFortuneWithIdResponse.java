package com.ssafy.agzak.domain.fortune.dto.response;

public record GuestFortuneWithIdResponse(
        FinalFortuneResponse fortune,
        String guestId
) {}
