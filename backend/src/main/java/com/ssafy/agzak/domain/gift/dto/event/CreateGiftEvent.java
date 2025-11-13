package com.ssafy.agzak.domain.gift.dto.event;

import lombok.Builder;
import lombok.Getter;

@Getter
public class CreateGiftEvent {
    private Long giftId;

    @Builder
    public CreateGiftEvent(Long giftId) {
        this.giftId = giftId;
    }
}
