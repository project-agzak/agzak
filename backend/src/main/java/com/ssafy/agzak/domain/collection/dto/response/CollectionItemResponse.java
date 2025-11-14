package com.ssafy.agzak.domain.collection.dto.response;

import java.time.LocalDateTime;

public record CollectionItemResponse(
        String code,          // COOKIE CODE (e.g., MONEY, LAVA)
        String name,          // 쿠키 이름
        String rarityCode,    // RARE | EPIC | UNIQUE
        int count,
        LocalDateTime obtainedAt
) {}
