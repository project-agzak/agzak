package com.ssafy.agzak.domain.gift.dto.response;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;

public record GiftResponse(
        Long giftId,
        Long senderId,
        String senderNickname,
        CookieResponse cookie,
        String message
) {
}
