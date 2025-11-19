package com.ssafy.agzak.domain.event.controller;

import com.ssafy.agzak.docs.EventApiDocs;
import com.ssafy.agzak.domain.event.dto.request.CreateEventRequest;
import com.ssafy.agzak.domain.event.dto.request.CreateEventTypeRequest;
import com.ssafy.agzak.domain.event.dto.response.EventResponse;
import com.ssafy.agzak.domain.event.service.EventService;
import com.ssafy.agzak.domain.event.service.EventTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/events")
@Validated
public class EventController implements EventApiDocs {

    private final EventService eventService;
    private final EventTypeService eventTypeService;

    @PostMapping("/types")
    public ResponseEntity<Void> createEventType(@RequestBody @Valid CreateEventTypeRequest request) {
        eventTypeService.createEventType(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/types")
    public ResponseEntity<Void> deleteEventType(@RequestParam String eventTypeName) {
        eventTypeService.deleteEventType(eventTypeName);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Void> createEvent(@RequestBody @Valid CreateEventRequest request) {
        eventService.createEvent(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok().build();
    }

}
