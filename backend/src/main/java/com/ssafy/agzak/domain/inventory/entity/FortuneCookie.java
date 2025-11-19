package com.ssafy.agzak.domain.inventory.entity;

import com.ssafy.agzak.domain.cookie.entity.CookieKind;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cookie_kind_id",
            foreignKey = @ForeignKey(name = "FK_cookie_kind"))
    private CookieKind cookieKind;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", unique = true,
            foreignKey = @ForeignKey(name = "FK_cookie_session"))
    private GameSession gameSession;

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

    public void updateStatusAvailable() {
        this.status = CookieStatus.AVAILABLE;
    }

    public void changeInventory(Inventory inventory) {
        this.inventory = inventory;
    }

    public enum CookieStatus { AVAILABLE, USED, PENDING_GIFT, DELETED }

    /** 사용 처리 */
    public void markUsed() {
        this.status = CookieStatus.USED;
    }

    /** 약삭제 처리 */
    public void markDeleted() {
        this.status = CookieStatus.DELETED;
    }

    public int getTotalScore() {
        return health + love + achievement + money;
    }
}