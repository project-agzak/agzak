package com.ssafy.agzak.domain.inventory.entity;

import com.ssafy.agzak.domain.game.entity.GameSession;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "fortune_cookie",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_cookie_session", columnNames = {"game_session_id"})
        },
        indexes = {
                @Index(name = "IDX_cookie_inventory", columnList = "inventory_id")
        }
)
public class FortuneCookie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fortune_cookie_id", nullable = false)
    private Long fortuneCookieId;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_cookie_inventory"))
    private Inventory inventory;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", unique = true,
            foreignKey = @ForeignKey(name = "FK_cookie_session"))
    private GameSession gameSession;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private CookieType type;

    @Column(name = "love", nullable = false)
    private Integer love;

    @Column(name = "money", nullable = false)
    private Integer money;

    @Column(name = "achievement", nullable = false)
    private Integer achievement;

    @Column(name = "health", nullable = false)
    private Integer health;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private CookieStatus status = CookieStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum CookieType { MONEY, LOVE, ACHIEVEMENT, HEALTH, MIXED, ROTTEN }
    public enum CookieStatus { AVAILABLE, USED }

    public void updateStatus() {
        this.status = CookieStatus.USED;
    }
}