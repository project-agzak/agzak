package com.ssafy.agzak.domain.coupon.util;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ConcurrentFCSUtil implements FCSUtil{

    private static final int MAX_RETRY_COUNT = 5;
    private final ConcurrentHashMap<Long, AtomicLong> counterMap = new ConcurrentHashMap<>();

    @Override
    public long nextOrder(Long couponId) {
        return counterMap
                .computeIfAbsent(couponId, k -> new AtomicLong(0L))
                .incrementAndGet();
    }

    @Override
    public void cleanCache(Long couponId) {
        counterMap.remove(couponId);
    }
}
