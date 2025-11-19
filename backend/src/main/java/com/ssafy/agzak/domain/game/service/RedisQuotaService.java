package com.ssafy.agzak.domain.game.service;

import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisQuotaService {
    public static final int MAX_CAP = 10;
    public static final int DEFAULT_CAP = 3;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final StringRedisTemplate redis;
    private final DateProvider date;

    private String capKey(Long memberId) {
        return "agzak:quota:%d:%s:cap".formatted(memberId, date.today().format(F));
    }
    private String idemKey(Long memberId, String idem) {
        return "agzak:quota:%d:%s:idem:%s".formatted(memberId, date.today().format(F), idem);
    }

    /** 오늘 cap 조회(없으면 기본값 설정 + 자정 TTL 부여) */
    public int getTodayCap(Long memberId) {
        String key = capKey(memberId);
        String v = redis.opsForValue().get(key);
        if (v == null) {
            // 기본값 저장
            redis.opsForValue().set(key, String.valueOf(DEFAULT_CAP));
            // 자정 TTL 설정
            ensureCapTtl(key);
            return DEFAULT_CAP;
        }
        // TTL 누락/음수(무기한)일 경우 자정 TTL 보강
        ensureCapTtl(key);
        return Integer.parseInt(v);
    }

    /** cap을 +1 (상한 10, 멱등키) — 실행 후에도 자정 TTL 보강 */
    public int claimOne(Long memberId, String idempotencyKey) {
        String capKey = capKey(memberId);
        String idemKey = idemKey(memberId, idempotencyKey);

        DefaultRedisScript<Long> script = getLongDefaultRedisScript();
        String now = String.valueOf(System.currentTimeMillis());
        String idemTtlMs = String.valueOf(24L * 60 * 60 * 1000); // 24h

        Long newCap = redis.execute(
                script,
                List.of(capKey, idemKey),
                String.valueOf(DEFAULT_CAP),
                String.valueOf(MAX_CAP),
                now,
                idemTtlMs
        );

        // cap 키의 TTL이 혹시 없을 수 있으니 자정 TTL 보강
        ensureCapTtl(capKey);
        return newCap.intValue();
    }

    private static DefaultRedisScript<Long> getLongDefaultRedisScript() {
        String lua = """
            local cap = redis.call('GET', KEYS[1])
            if not cap then cap = tostring(ARGV[1]) end
            cap = tonumber(cap)
            local maxCap = tonumber(ARGV[2])
            if cap >= maxCap then
                return cap
            end
            if redis.call('SETNX', KEYS[2], ARGV[3]) == 0 then
                return cap
            end
            cap = cap + 1
            if cap > maxCap then cap = maxCap end
            redis.call('SET', KEYS[1], tostring(cap))
            redis.call('PEXPIRE', KEYS[2], ARGV[4]) -- 멱등키 TTL(ms)
            return cap
        """;

        return new DefaultRedisScript<>(lua, Long.class);
    }

    /** cap 키에 자정(KST) 만료를 보장 */
    private void ensureCapTtl(String key) {
        Long ttlSec = redis.getExpire(key, TimeUnit.SECONDS);
        // ttlSec < 0: -1(무기한) 또는 -2(존재X)
        if (ttlSec < 0) {
            redis.expireAt(key, nextMidnightKSTDate());
            return;
        }
        // 이미 TTL이 있는데, 자정보다 길다면 그대로 두고,
        // 무기한(-1) 또는 없음(-2)만 보강한다. (원한다면 "자정보다 길면 자정으로 단축"도 가능)
    }

    /** 내일 00:00:05 KST (5초 버퍼) Date 객체 */
    private Date nextMidnightKSTDate() {
        LocalDate tomorrow = date.today().plusDays(1);
        LocalDateTime ldt = LocalDateTime.of(tomorrow, LocalTime.MIDNIGHT).plusSeconds(5);
        Instant instant = ldt.atZone(KST).toInstant();
        return Date.from(instant);
    }
}
