package com.ssafy.agzak.domain.coupon.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_type_id", nullable = false)
    private CouponType couponType;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "issued_quantity", nullable = false)
    private Integer issuedQuantity = 0;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Builder
    public Coupon(CouponType couponType, String description, Integer totalQuantity) {
        this.couponType = couponType;
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
