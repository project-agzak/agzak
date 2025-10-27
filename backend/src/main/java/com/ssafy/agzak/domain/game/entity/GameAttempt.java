package com.ssafy.agzak.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "game_attempt",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_attempt_order", columnNames = {"game_session_id", "attempt_no"})
        }
)
public class GameAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_attempt_id", nullable = false)
    private Long gameAttemptId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_session_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_attempt_session"))
    private GameSession gameSession;

    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo; // 1..10

    @Enumerated(EnumType.STRING)
    @Column(name = "aspect_name", nullable = false, length = 20)
    private AspectName aspectName;

    @Enumerated(EnumType.STRING)
    @Column(name = "fire_type", nullable = false, length = 20)
    private FireType fireType;

    @Column(name = "base_prob", nullable = false, precision = 5, scale = 2)
    private BigDecimal baseProb; // 직전 기본성공확률

    @Column(name = "adjustment_pp", nullable = false, precision = 5, scale = 2)
    private BigDecimal adjustmentPp; // 약한불 +5 / 강한불 -5 (pp)

    @Column(name = "applied_prob", nullable = false, precision = 5, scale = 2)
    private BigDecimal appliedProb; // base + adjustment

    @Column(name = "is_success", nullable = false)
    private Boolean isSuccess;

    @Column(name = "delta_value", nullable = false)
    private Integer deltaValue; // 성공/실패 증감치

    @Column(name = "next_base_prob", nullable = false, precision = 5, scale = 2)
    private BigDecimal nextBaseProb; // 다음 기본성공확률

    @Column(name = "snap_love", nullable = false)
    private Integer snapLove;

    @Column(name = "snap_money", nullable = false)
    private Integer snapMoney;

    @Column(name = "snap_achievement", nullable = false)
    private Integer snapAchievement;

    @Column(name = "snap_health", nullable = false)
    private Integer snapHealth;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum AspectName { MONEY, LOVE, ACHIEVEMENT, HEALTH }

    public enum FireType { WEAK, STRONG }
}