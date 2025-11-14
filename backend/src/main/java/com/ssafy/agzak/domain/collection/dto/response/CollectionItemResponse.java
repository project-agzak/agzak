package com.ssafy.agzak.domain.collection.dto.response;

import java.time.LocalDateTime;

public record CollectionItemResponse(
        String code,          // COOKIE CODE (e.g., MONEY, LAVA)
        String name,          // 쿠키 이름
        String rarityCode,    // RARE | EPIC | UNIQUE
        String recipe,        // 레시피 설명
        String message,       // 메시지
        int count,
        LocalDateTime obtainedAt
) {}