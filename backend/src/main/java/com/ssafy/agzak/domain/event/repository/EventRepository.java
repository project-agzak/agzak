package com.ssafy.agzak.domain.event.repository;

import com.ssafy.agzak.domain.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    void deleteByEventId(Long eventId);
}
