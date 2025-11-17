package com.ssafy.agzak.domain.coupon.repository;

import com.ssafy.agzak.domain.coupon.entity.MemberCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long> {
}
