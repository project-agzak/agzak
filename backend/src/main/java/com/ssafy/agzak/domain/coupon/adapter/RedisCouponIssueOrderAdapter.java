package com.ssafy.agzak.domain.coupon.adapter;

import com.ssafy.agzak.domain.coupon.port.CouponIssueOrderPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisCouponIssueOrderAdapter implements CouponIssueOrderPort {

    private static final String COUPON_ISSUE_ORDER_KEY = "coupon:issue:order";
    private final StringRedisTemplate redisTemplate;

    @Override
    public long nextOrder(Long couponId) {
        String key = COUPON_ISSUE_ORDER_KEY + ":" + couponId;
        Long increment = redisTemplate.opsForValue().increment(key);
        return increment==null ? 0:increment;
    }

    @Override
    public void cleanCache(Long couponId) {
        String key = COUPON_ISSUE_ORDER_KEY + ":" + couponId;
        redisTemplate.delete(key);
    }
}
