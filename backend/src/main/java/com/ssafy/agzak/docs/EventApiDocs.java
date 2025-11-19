package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.event.dto.request.CreateEventRequest;
import com.ssafy.agzak.domain.event.dto.request.CreateEventTypeRequest;
import com.ssafy.agzak.domain.event.dto.response.EventResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "이벤트", description = "이벤트 API 문서")
public interface EventApiDocs {
    @Operation(summary = "이벤트 타입 생성", description = "이벤트 타입을 생성합니다.")
    public ResponseEntity<Void> createEventType(@RequestBody @Valid CreateEventTypeRequest request);
    @Operation(summary = "이벤트 타입 삭제", description = "이벤트 타입을 삭제합니다.")
    public ResponseEntity<Void> deleteEventType(@RequestParam String eventTypeName);
    @Operation(summary = "이벤트 생성", description = "이벤트를 생성합니다.")
    public ResponseEntity<Void> createEvent(@RequestBody @Valid CreateEventRequest request);
    @Operation(summary = "모든 이벤트 조회", description = "모든 이벤트를 조회합니다.")
    public ResponseEntity<List<EventResponse>> getAllEvents();
    @Operation(summary = "이벤트 삭제", description = "이벤트를 삭제합니다.")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId);
}
