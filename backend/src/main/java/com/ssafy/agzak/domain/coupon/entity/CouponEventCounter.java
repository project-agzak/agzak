package com.ssafy.agzak.domain.coupon.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Table(
        name = "coupon_event_counters",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_coupon_event_counters_coupon_id",
                        columnNames = "coupon_id"
                )
        }
)
@Entity
@NoArgsConstructor
@Getter
@DynamicInsert
@EntityListeners(AuditingEntityListener.class)
public class CouponEventCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_issue_counter_id", nullable = false)
    private Long couponIssueCounterId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Column(name = "attempt_count", nullable = false)
    @ColumnDefault("0")
    private Integer attemptCount;

    @Builder
    public CouponEventCounter(Coupon coupon) {
        this.coupon = coupon;
    }
}
