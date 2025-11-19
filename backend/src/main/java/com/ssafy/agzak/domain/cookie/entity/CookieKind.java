package com.ssafy.agzak.domain.cookie.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "cookie_kind", indexes = {
        @Index(name = "IDX_cookie_kind_rarity", columnList = "rarity_id")
}, uniqueConstraints = @UniqueConstraint(name = "UQ_cookie_kind_code", columnNames = "code"))
public class CookieKind {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cookie_kind_id")
    private Long cookieKindId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rarity_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_cookie_kind_rarity"))
    private Rarity rarity;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "recipe")
    private String recipe;

    @Column(name = "message")
    private String message;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
