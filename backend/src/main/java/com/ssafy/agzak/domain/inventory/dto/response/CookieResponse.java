package com.ssafy.agzak.domain.inventory.dto.response;

import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;

import java.time.LocalDateTime;

public record CookieResponse(long fortuneCookieId, String type, int love, int money,
                             int achievement, int health, LocalDateTime createdAt) {

    public static CookieResponse fromEntity(FortuneCookie fortuneCookie) {
        return new CookieResponse(fortuneCookie.getFortuneCookieId(), fortuneCookie.getType().name(),
                fortuneCookie.getLove(), fortuneCookie.getMoney(), fortuneCookie.getAchievement(), fortuneCookie.getHealth(),
                fortuneCookie.getCreatedAt()
        );
    }
}
