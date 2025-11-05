package com.ssafy.agzak.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CaffeineCacheManager cacheManager() {
        CaffeineCacheManager m = new CaffeineCacheManager("fortuneCache");
        m.setCaffeine(Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfter(new com.github.benmanes.caffeine.cache.Expiry<Object, Object>() {
                    @Override
                    public long expireAfterCreate(Object key, Object value, long currentTimeNanos) {
                        return nanosUntilNextMidnightKST();
                    }
                    @Override
                    public long expireAfterUpdate(Object key, Object value, long currentTimeNanos, long currentDurationNanos) {
                        return nanosUntilNextMidnightKST();
                    }
                    @Override
                    public long expireAfterRead(Object key, Object value, long currentTimeNanos, long currentDurationNanos) {
                        return currentDurationNanos;
                    }
                })
        );
        return m;
    }

    private long nanosUntilNextMidnightKST() {
        var zone = ZoneId.of("Asia/Seoul");
        var now = ZonedDateTime.now(zone);
        var midnight = now.toLocalDate().plusDays(1).atStartOfDay(zone);
        long seconds = Duration.between(now, midnight).getSeconds();
        return TimeUnit.SECONDS.toNanos(Math.max(seconds, 1));
    }
}
