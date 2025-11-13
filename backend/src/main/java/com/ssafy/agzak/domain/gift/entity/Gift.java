package com.ssafy.agzak.domain.gift.entity;

import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "gifts")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Gift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gift_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Member receiver;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cookie_id", nullable = false)
    private FortuneCookie fortuneCookie;

    @Column(name = "message", length = 255)
    private String message;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private GiftStatus status;

    @Column(name = "sent_at", nullable = false)
    @CreatedDate
    private LocalDateTime sentAt;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Builder
    public Gift(Member sender, Member receiver, FortuneCookie fortuneCookie, String message, GiftStatus status) {
        this.sender = sender;
        this.receiver = receiver;
        this.fortuneCookie = fortuneCookie;
        this.message = message;
        this.status = status;
    }

    public void receiveGift() {
        this.status = GiftStatus.RECEIVED;
        this.fortuneCookie.updateStatusAvailable();
        this.receivedAt = LocalDateTime.now();
    }
}
