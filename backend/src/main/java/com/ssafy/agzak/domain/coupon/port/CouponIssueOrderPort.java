package com.ssafy.agzak.domain.coupon.port;

public interface CouponIssueOrderPort {
    long nextOrder(Long couponId);

    void cleanCache(Long couponId);
}
