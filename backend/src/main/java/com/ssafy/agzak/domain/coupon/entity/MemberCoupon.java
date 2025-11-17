package com.ssafy.agzak.domain.coupon.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_coupons")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MemberCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "issued_at", nullable = false)
    @CreatedDate
    private LocalDateTime issuedAt;

    @Builder
    public MemberCoupon(Coupon coupon, Member member, LocalDateTime issuedAt) {
        this.coupon = coupon;
        this.member = member;
        this.issuedAt = issuedAt;
    }

}
