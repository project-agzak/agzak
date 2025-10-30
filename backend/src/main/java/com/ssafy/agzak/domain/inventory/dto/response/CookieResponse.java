package com.ssafy.agzak.domain.inventory.dto.response;

import java.time.LocalDateTime;

public record CookieResponse(long fortuneCookieId, String type, int love, int money,
                             int achievement, int health, LocalDateTime createdAt) {
}
