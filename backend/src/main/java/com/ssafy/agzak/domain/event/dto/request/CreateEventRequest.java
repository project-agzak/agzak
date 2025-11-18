package com.ssafy.agzak.domain.event.dto.request;

import com.ssafy.agzak.domain.event.entity.EventStatus;

import java.time.LocalDateTime;

public record CreateEventRequest(
        Long eventTypeId,
        EventStatus eventStatus,
        String title,
        String description,
        String imageUrl,
        LocalDateTime startAt,
        LocalDateTime endAt
) {
}
