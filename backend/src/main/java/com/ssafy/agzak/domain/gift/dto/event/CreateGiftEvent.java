package com.ssafy.agzak.domain.gift.dto.event;

import lombok.Builder;
import lombok.Getter;

@Getter
public class CreateGiftEvent {
    private Long giftId;
    private Long senderId;
    private Long receiverId;

    @Builder
    public CreateGiftEvent(Long giftId, Long senderId, Long receiverId) {
        this.giftId = giftId;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
}
