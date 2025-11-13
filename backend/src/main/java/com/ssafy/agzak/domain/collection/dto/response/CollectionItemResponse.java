package com.ssafy.agzak.domain.collection.dto.response;

import java.time.LocalDateTime;

public record CollectionItemResponse(
        String type,
        int count,
        String description,
        LocalDateTime obtainedAt
) {}
