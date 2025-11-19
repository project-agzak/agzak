package com.ssafy.agzak.domain.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(name = "cookie_daily_usage",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_cookie_usage_member_date", columnNames = {"member_id", "use_date"})
        })
public class CookieDailyUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cookieDailyUsageId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "use_date", nullable = false)
    private LocalDate date;

    @Column(name = "used_count", nullable = false)
    private int usedCount;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void increase(LocalDateTime now) {
        this.usedCount += 1;
        this.updatedAt = now;
    }
}
