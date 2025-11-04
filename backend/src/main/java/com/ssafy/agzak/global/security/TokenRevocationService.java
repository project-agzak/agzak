package com.ssafy.agzak.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class TokenRevocationService {
    private static final String KEY_PREFIX = "auth:blacklist:";
    private final StringRedisTemplate redis;

    public void revoke(String accessToken, Duration ttl) {
        redis.opsForValue().set(KEY_PREFIX + accessToken, "1", ttl);
    }
    public boolean isRevoked(String accessToken) {
        return redis.hasKey(KEY_PREFIX + accessToken);
    }
}
