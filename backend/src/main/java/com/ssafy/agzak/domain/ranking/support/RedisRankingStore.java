package com.ssafy.agzak.domain.ranking.support;

import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisCallback;
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
    private final DateProvider date;
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd");

    private String key(LocalDate d, String suffix) { return "rank:" + d.format(DAY) + ":" + suffix; }

    public Long zcard(String zset) {
        try {
            return redis.opsForZSet().zCard(zset);
        } catch (Exception e) {
            return null; // Redis 다운 등
        }
    }

    public boolean exists(String key) {
        try {
            return redis.hasKey(key);
        } catch (Exception e) {
            return false;
        }
    }

    public void bulkUpsertTodayUsers(List<UserRow> rows) {
        LocalDate d = today();
        String zTotal = zTotal(d);
        String zOriginal = zOriginal(d);
        String zGain = zGain(d);

        redis.executePipelined((RedisCallback<Object>) connection -> {
            HashOperations<String, String, String> h = redis.opsForHash();
            ZSetOperations<String, String> z = redis.opsForZSet();

            for (UserRow r : rows) {
                String hUser = hUser(d, r.memberId());
                if (r.nickname() != null) h.put(hUser, "nickname", r.nickname());
                if (r.total() != null)    h.put(hUser, "total", String.valueOf(r.total()));
                if (r.original() != null) h.put(hUser, "original", String.valueOf(r.original()));

                double gain = RankCalculator.increasePct(r.original(), r.total());
                if (r.total() != null)    z.add(zTotal, String.valueOf(r.memberId()), r.total().doubleValue());
                if (r.original() != null) z.add(zOriginal, String.valueOf(r.memberId()), r.original().doubleValue());
                z.add(zGain, String.valueOf(r.memberId()), gain);
            }
            return null;
        });
    }

    public String zTotal(LocalDate d)    { return key(d, "total"); }
    public String zOriginal(LocalDate d) { return key(d, "original"); }
    public String zGain(LocalDate d)     { return key(d, "gain"); }
    public String hUser(LocalDate d, Long memberId){ return key(d, "user:"+memberId); }

    public LocalDate today() { return date.today(); }

    public void upsertTodayUser(Long memberId, String nickname, Integer total, Integer original) {
        LocalDate d = today();
        String hUser = hUser(d, memberId);
        String zTotal = zTotal(d);
        String zOriginal = zOriginal(d);
        String zGain = zGain(d);

        double gain = RankCalculator.increasePct(original, total);

        redis.executePipelined((RedisCallback<Object>) connection -> {
            HashOperations<String, String, String> h = redis.opsForHash();
            ZSetOperations<String, String> z = redis.opsForZSet();

            if (nickname != null) h.put(hUser, "nickname", nickname);
            if (total != null)    h.put(hUser, "total", String.valueOf(total));
            if (original != null) h.put(hUser, "original", String.valueOf(original));

            if (total != null)       z.add(zTotal, String.valueOf(memberId), total.doubleValue());
            if (original != null)    z.add(zOriginal, String.valueOf(memberId), original.doubleValue());
            z.add(zGain, String.valueOf(memberId), gain);

            return null;
        });
    }

    public void removeTodayUser(Long memberId) {
        LocalDate d = today();
        redis.executePipelined((RedisCallback<Object>) connection -> {
            redis.delete(hUser(d, memberId));
            redis.opsForZSet().remove(zTotal(d), String.valueOf(memberId));
            redis.opsForZSet().remove(zOriginal(d), String.valueOf(memberId));
            redis.opsForZSet().remove(zGain(d), String.valueOf(memberId));
            return null;
        });
    }

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

