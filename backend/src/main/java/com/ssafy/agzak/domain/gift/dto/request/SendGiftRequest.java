package com.ssafy.agzak.domain.gift.dto.request;

public record SendGiftRequest(
        Long receiverId,
        Long cookieId,
        String message
) {
}
