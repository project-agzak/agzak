package com.ssafy.agzak.domain.event.service;

import com.ssafy.agzak.domain.event.dto.request.CreateEventRequest;
import com.ssafy.agzak.domain.event.dto.response.EventResponse;
import com.ssafy.agzak.domain.event.entity.Event;
import com.ssafy.agzak.domain.event.repository.EventRepository;
import com.ssafy.agzak.domain.event.repository.EventTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventTypeRepository eventTypeRepository;

    @Transactional
    public void createEvent(CreateEventRequest request) {
        eventRepository.save(
                Event.builder()
                        .type(
                                eventTypeRepository.getReferenceById(request.eventTypeId()
                                ))
                        .status(request.eventStatus())
                        .title(request.title())
                        .description(request.description())
                        .imageUrl(request.imageUrl())
                        .startAt(request.startAt())
                        .endAt(request.endAt())
                        .build()
        );
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findAll() {
        return eventRepository.findAllByOrderByEventIdDesc()
                .stream()
                .map(EventResponse::from)
                .toList();
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        eventRepository.deleteByEventId(eventId);
    }
}
