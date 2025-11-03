package com.ssafy.agzak.domain.guest.support;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RedisGuestProfileStore implements GuestProfileStore {

    private final StringRedisTemplate redis;
    private final ObjectMapper om = new ObjectMapper();

    @Value("${guest.ttl-hours:24}")
    private long ttlHours;

    private String key(String guestId) { return "guest:profile:" + guestId; }

    @Override
    public String save(GuestProfile profile) {
        String id = UUID.randomUUID().toString();
        try {
            String json = om.writeValueAsString(profile);
            redis.opsForValue().set(key(id), json, Duration.ofHours(ttlHours));
            return id;
        } catch (Exception e) {
            throw new IllegalStateException("게스트 프로필 저장 실패", e);
        }
    }

    @Override
    public GuestProfile find(String guestId) {
        String json = redis.opsForValue().get(key(guestId));
        if (json == null) return null;
        try {
            return om.readValue(json, new TypeReference<GuestProfile>(){});
        } catch (Exception e) {
            throw new IllegalStateException("게스트 프로필 역직렬화 실패", e);
        }
    }

    @Override
    public void delete(String guestId) {
        redis.delete(key(guestId));
    }
}