package com.ssafy.agzak.domain.event.repository;

import com.ssafy.agzak.domain.event.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventTypeRepository extends JpaRepository<EventType, Long> {
    void deleteByName(String eventTypeName);
}
