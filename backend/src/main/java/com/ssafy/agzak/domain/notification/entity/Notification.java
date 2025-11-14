package com.ssafy.agzak.domain.notification.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@NoArgsConstructor
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "noti_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotiType notiType;

    @Column(name = "ref_id", nullable = false)
    private Long refId;

    @Column(name = "message", nullable = false, length = 50)
    private String message;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Builder
    public Notification(Member member, NotiType notiType, Long refId, String message) {
        this.member = member;
        this.notiType = notiType;
        this.refId = refId;
        this.message = message;
    }

    public void markAsRead() {
        this.readAt = LocalDateTime.now();
    }

    public void markAsDeleted() {
        this.isDeleted = true;
    }

}
