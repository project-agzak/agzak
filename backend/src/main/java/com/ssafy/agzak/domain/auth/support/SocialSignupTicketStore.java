package com.ssafy.agzak.domain.auth.support;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SocialSignupTicketStore {
    private final StringRedisTemplate redis;
    private final ObjectMapper om = new ObjectMapper();

    @Value("${social.signup.ticket-ttl-minutes:30}")
    private long ttlMinutes;

    private String key(String t) { return "social:signup:ticket:" + t; }

    public String create(Map<String, String> payload) {
        String t = UUID.randomUUID().toString();
        try {
            redis.opsForValue().set(key(t), om.writeValueAsString(payload), Duration.ofMinutes(ttlMinutes));
            return t;
        } catch (Exception e) { throw new IllegalStateException("티켓 저장 실패", e); }
    }

    public Map<String, String> get(String ticket) {
        String json = redis.opsForValue().get(key(ticket));
        if (json == null) return null;
        try { return om.readValue(json, new TypeReference<Map<String, String>>(){}); }
        catch (Exception e) { throw new IllegalStateException("티켓 역직렬화 실패", e); }
    }

    public void delete(String ticket) { redis.delete(key(ticket)); }
}
