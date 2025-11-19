package com.ssafy.agzak.domain.event.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@NoArgsConstructor
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_status", nullable = false)
    private EventStatus status;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Event(EventType type, EventStatus status, String title, String description,
                 String imageUrl, LocalDateTime startAt, LocalDateTime endAt) {
        this.type = type;
        this.status = status;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.startAt = startAt;
        this.endAt = endAt;
    }
}
