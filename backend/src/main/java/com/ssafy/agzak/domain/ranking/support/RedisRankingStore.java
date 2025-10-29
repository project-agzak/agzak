package com.ssafy.agzak.domain.ranking.support;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@RequiredArgsConstructor
public class RedisRankingStore {

    private final RedisTemplate<String, String> redis;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd");

    private String key(LocalDate d, String suffix) { return "rank:" + d.format(DAY) + ":" + suffix; }
    public String zTotal(LocalDate d)    { return key(d, "total"); }
    public String zOriginal(LocalDate d) { return key(d, "original"); }
    public String zGain(LocalDate d)     { return key(d, "gain"); }
    public String hUser(LocalDate d, Long memberId){ return key(d, "user:"+memberId); }

    public LocalDate today() { return LocalDate.now(KST); }

    /** 오늘자 TOP N 읽기(ZSET + HASH) → memberId, nickname, total, original */
    public List<UserRow> readTop(LocalDate d, String zset, int limit) {
        ZSetOperations<String,String> z = redis.opsForZSet();
        HashOperations<String,String,String> h = redis.opsForHash();

        Set<ZSetOperations.TypedTuple<String>> rows = z.reverseRangeWithScores(zset, 0, Math.max(0, limit-1));
        if (rows == null || rows.isEmpty()) return List.of();

        List<UserRow> out = new ArrayList<>();
        for (var t : rows) {
            String midStr = t.getValue();
            if (midStr == null) continue;
            Long mid = Long.valueOf(midStr);
            String hk = hUser(d, mid);
            String nick = h.get(hk, "nickname");
            Integer total = parseInt(h.get(hk, "total"));
            Integer orig  = parseInt(h.get(hk, "original"));
            out.add(new UserRow(mid, nick, total, orig));
        }
        return out;
    }

    public Integer zrevRank1Base(String zset, long memberId) {
        ZSetOperations<String,String> z = redis.opsForZSet();
        if (!redis.hasKey(zset)) return null;
        Long zero = z.reverseRank(zset, String.valueOf(memberId));
        return zero == null ? null : (int)(zero + 1);
    }

    private Integer parseInt(String s) {
        try { return s==null?null:Integer.valueOf(s); } catch (Exception e){ return null; }
    }

    public record UserRow(Long memberId, String nickname, Integer total, Integer original){}
}

