package com.ssafy.agzak.domain.event.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "event_types")
@NoArgsConstructor
@Getter
public class EventType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_type_id")
    private Long eventTypeId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Builder
    public EventType(String name) {
        this.name = name;
    }
}
