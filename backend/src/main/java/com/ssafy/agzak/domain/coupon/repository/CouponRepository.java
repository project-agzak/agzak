package com.ssafy.agzak.domain.coupon.repository;

import com.ssafy.agzak.domain.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
}
