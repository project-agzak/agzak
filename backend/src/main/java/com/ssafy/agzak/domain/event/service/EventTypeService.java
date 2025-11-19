package com.ssafy.agzak.domain.event.service;

import com.ssafy.agzak.domain.event.dto.request.CreateEventTypeRequest;
import com.ssafy.agzak.domain.event.entity.EventType;
import com.ssafy.agzak.domain.event.repository.EventTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventTypeService {

    private final EventTypeRepository eventTypeRepository;

    @Transactional
    public void createEventType(CreateEventTypeRequest request) {
        eventTypeRepository.save(
                EventType.builder()
                        .name(request.eventTypeName())
                        .build()
        );
    }

    @Transactional
    public void deleteEventType(String eventTypeName) {
        eventTypeRepository.deleteByName(eventTypeName);
    }
}
