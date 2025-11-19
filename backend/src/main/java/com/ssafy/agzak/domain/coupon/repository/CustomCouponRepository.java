package com.ssafy.agzak.domain.coupon.repository;

import com.ssafy.agzak.domain.coupon.entity.Coupon;

import java.util.Optional;

public interface CustomCouponRepository {
    Optional<Coupon> findByCouponIdForUpdate(Long couponId);
    long updateCouponQuantity(Long couponId);
}
