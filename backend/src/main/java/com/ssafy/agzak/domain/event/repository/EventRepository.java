package com.ssafy.agzak.domain.event.repository;

import com.ssafy.agzak.domain.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    void deleteByEventId(Long eventId);
    List<Event> findAllByOrderByEventIdDesc();
}
