package com.ssafy.agzak.domain.coupon.entity;

import com.ssafy.agzak.domain.event.entity.Event;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@DynamicInsert
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_id", nullable = false)
    private Long couponId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_type_id", nullable = false)
    private CouponType couponType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "issued_quantity", nullable = false)
    @ColumnDefault("0")
    private Integer issuedQuantity = 0;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Builder
    public Coupon(CouponType couponType,
                  Event event,
                  String description,
                  Integer totalQuantity) {
        this.couponType = couponType;
        this.event = event;
        this.description = description;
        this.totalQuantity = totalQuantity;
    }

    public void issue() {
        if (this.issuedQuantity < this.totalQuantity) {
            this.issuedQuantity++;
        } else {
            throw new IllegalStateException("No more coupons available to issue.");
        }
    }

    public void expire() {
        this.expiresAt = LocalDateTime.now();
    }
}
