package com.ssafy.agzak.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RefreshTokenStore {
    private static final String KEY_PREFIX = "auth:refresh:";
    private final StringRedisTemplate redis;

    public void save(Long memberId, String token, Duration ttl) {
        redis.opsForValue().set(KEY_PREFIX + memberId, token, ttl);
    }
    public Optional<String> get(Long memberId) {
        return Optional.ofNullable(redis.opsForValue().get(KEY_PREFIX + memberId));
    }
    public void delete(Long memberId) {
        redis.delete(KEY_PREFIX + memberId);
    }
}
