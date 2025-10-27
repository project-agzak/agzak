package com.ssafy.agzak.domain.game.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "game_session",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_game_day_quota", columnNames = {"member_id", "game_date", "session_no"})
        }
)
public class GameSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_session_id", nullable = false)
    private Long gameSessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_game_session_member"))
    private Member member;

    @Column(name = "game_date", nullable = false)
    private LocalDate gameDate;

    @Column(name = "session_no", nullable = false)
    private Integer sessionNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private SessionStatus status;

    @Column(name = "initial_success_prob", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal initialSuccessProb = new BigDecimal("70.00");

    @Column(name = "attempts_limit", nullable = false)
    @Builder.Default
    private Integer attemptsLimit = 10;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum SessionStatus { IN_PROGRESS, COMPLETED, CANCELLED }
}