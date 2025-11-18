package com.ssafy.agzak.domain.event.dto.response;

import com.ssafy.agzak.domain.event.entity.Event;
import lombok.Builder;

public record EventResponse(
        Long eventId,
        String eventTypeName,
        String eventStatus,
        String title,
        String description,
        String imageUrl,
        String startAt,
        String endAt
) {
    @Builder
    public EventResponse {
    }

    public static EventResponse from(Event event) {
        return EventResponse.builder()
                .eventId(event.getEventId())
                .eventTypeName(event.getType().getName())
                .eventStatus(event.getStatus().name())
                .title(event.getTitle())
                .description(event.getDescription())
                .imageUrl(event.getImageUrl())
                .startAt(event.getStartAt().toString())
                .endAt(event.getEndAt().toString())
                .build();
    }
}
