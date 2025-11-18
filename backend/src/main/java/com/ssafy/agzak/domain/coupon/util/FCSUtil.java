package com.ssafy.agzak.domain.coupon.util;

public interface FCSUtil {
    long nextOrder(Long couponId);

    void cleanCache(Long couponId);
}
