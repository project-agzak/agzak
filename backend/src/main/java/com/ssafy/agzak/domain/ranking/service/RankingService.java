package com.ssafy.agzak.domain.ranking.service;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.ranking.dto.response.RankingItemResponse;
import com.ssafy.agzak.domain.ranking.dto.response.SnapshotRankingResponse;
import com.ssafy.agzak.domain.ranking.dto.response.TodayRankingResponse;
import com.ssafy.agzak.domain.ranking.entity.Ranking;
import com.ssafy.agzak.domain.ranking.repository.RankingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final RedisTemplate<String, String> redis;
    private final RankingRepository rankingRepository;
    private final FortuneRepository fortuneRepository;

    private String dayKey(LocalDate d) { return d.format(DAY); }
    private String zTotal(LocalDate d) { return "rank:" + dayKey(d) + ":total"; }
    private String zOriginal(LocalDate d) { return "rank:" + dayKey(d) + ":original"; }
    private String zGain(LocalDate d) { return "rank:" + dayKey(d) + ":gain"; } // ZSET: 증가율
    private String hUser(LocalDate d, Long memberId) { return "rank:" + dayKey(d) + ":user:" + memberId; }

    /** 오늘 랭킹을 Redis 에서 읽기 (없으면 빈 리스트) */
    public TodayRankingResponse getTodayFromRedis(int limit) {
        LocalDate today = LocalDate.now(KST);

        List<RankingItemResponse> total = readZsetWithDetail(today, zTotal(today), limit);
        List<RankingItemResponse> original = readZsetWithDetail(today, zOriginal(today), limit);
        List<RankingItemResponse> increase = readZsetWithDetail(today, zGain(today), limit);

        // 각 리스트의 랭크 번호 채움
        for (int i = 0; i < total.size(); i++)      total.set(i, withTotalRank(total.get(i), i + 1));
        for (int i = 0; i < original.size(); i++)   original.set(i, withOriginalRank(original.get(i), i + 1));
        for (int i = 0; i < increase.size(); i++)   increase.set(i, withIncreaseRank(increase.get(i), i + 1));

        return TodayRankingResponse.builder()
                .date(today)
                .totalLeaderboard(total)
                .originalLeaderboard(original)
                .increaseLeaderboard(increase)
                .build();
    }

    /** 특정 날짜 스냅샷을 MySQL 에서 읽기(총점 기준) */
    public SnapshotRankingResponse getSnapshotFromMysql(LocalDate date, int limit) {
        List<Ranking> ranks = rankingRepository.findByDateOrderByRankNoAsc(date);
        List<RankingItemResponse> list = ranks.stream()
                .limit(limit)
                .map(r -> RankingItemResponse.builder()
                        .memberId(r.getMember().getMemberId())
                        .nickname(r.getMember().getNickname())
                        .totalScore(r.getTotalScore())
                        .originalTotalScore(r.getOriginalTotalScore())
                        .totalRank(r.getRankNo())
                        .originalRank(null)
                        .increaseRank(null)
                        .increasePercent(increasePct(r.getOriginalTotalScore(), r.getTotalScore()))
                        .build())
                .collect(Collectors.toList());
        return SnapshotRankingResponse.builder()
                .date(date)
                .leaderboard(list)
                .build();
    }

    /** 오늘 특정 멤버의 Fortune이 갱신될 때 Redis 랭킹 반영 */
    @Transactional
    public void upsertTodayMemberToRedis(Member member) {
        LocalDate today = LocalDate.now(KST);
        Fortune f = fortuneRepository.findTopByMemberAndDate(member, today);
        if (f == null) return;

        String userKey = hUser(today, member.getMemberId());
        HashOperations<String, String, String> hash = redis.opsForHash();
        ZSetOperations<String, String> z = redis.opsForZSet();

        // 유저 데이터 저장/업데이트
        hash.put(userKey, "nickname", member.getNickname());
        hash.put(userKey, "total", String.valueOf(f.getTotalScore()));
        hash.put(userKey, "original", String.valueOf(f.getOriginalTotalScore()));

        // 랭킹 점수 반영 (총점/기존점수/증가율)
        z.add(zTotal(today), member.getMemberId().toString(), f.getTotalScore());
        z.add(zOriginal(today), member.getMemberId().toString(), f.getOriginalTotalScore());
        double gain = increasePct(f.getOriginalTotalScore(), f.getTotalScore());
        z.add(zGain(today), member.getMemberId().toString(), gain); // 증가율 ZSET
    }

    /** (배치) 오늘 전체 Fortune을 읽어 Redis/스냅샷 갱신 */
    @Transactional
    public void rebuildTodayRedisAndSnapshot() {
        LocalDate today = LocalDate.now(KST);
        List<Fortune> fortunes = fortuneRepository.findAllByDateWithMember(today);

        // Redis 전체 리빌드 (세 키 모두 삭제)
        String zt = zTotal(today), zo = zOriginal(today), zg = zGain(today);
        redis.delete(Arrays.asList(zt, zo, zg));
        List<String> toDelete = fortunes.stream().map(f -> hUser(today, f.getMember().getMemberId())).toList();
        if (!toDelete.isEmpty()) redis.delete(toDelete);

        HashOperations<String, String, String> hash = redis.opsForHash();
        ZSetOperations<String, String> z = redis.opsForZSet();

        for (Fortune f : fortunes) {
            Long mid = f.getMember().getMemberId();
            String userKey = hUser(today, mid);

            hash.put(userKey, "nickname", f.getMember().getNickname());
            hash.put(userKey, "total", String.valueOf(f.getTotalScore()));
            hash.put(userKey, "original", String.valueOf(f.getOriginalTotalScore()));

            z.add(zt, mid.toString(), f.getTotalScore());
            z.add(zo, mid.toString(), f.getOriginalTotalScore());
            double gain = increasePct(f.getOriginalTotalScore(), f.getTotalScore());
            z.add(zg, mid.toString(), gain); // 증가율 ZSET
        }

        // MySQL 스냅샷(총점 기준) 저장
        rankingRepository.deleteByDate(today);

        // ZSET의 현재 순위를 기준으로 rank_no 생성 (총점 기준)
        Set<ZSetOperations.TypedTuple<String>> tops = z.reverseRangeWithScores(zt, 0, fortunes.size());
        if (tops == null) tops = Set.of();

        int rank = 1;
        List<Ranking> saveList = new ArrayList<>();
        Map<Long, Fortune> byMember = fortunes.stream()
                .collect(Collectors.toMap(f -> f.getMember().getMemberId(), f -> f));

        for (ZSetOperations.TypedTuple<String> t : tops) {
            Long mid = Long.valueOf(Objects.requireNonNull(t.getValue()));
            Fortune f = byMember.get(mid);
            if (f == null) continue;

            Ranking r = Ranking.builder()
                    .member(f.getMember())
                    .date(today)
                    .rankNo(rank++)
                    .totalScore(f.getTotalScore())
                    .originalTotalScore(f.getOriginalTotalScore())
                    .build();
            saveList.add(r);
        }
        if (!saveList.isEmpty()) rankingRepository.saveAll(saveList);
    }

    private List<RankingItemResponse> readZsetWithDetail(LocalDate d, String zkey, int limit) {
        ZSetOperations<String, String> z = redis.opsForZSet();
        HashOperations<String, String, String> hash = redis.opsForHash();

        Set<ZSetOperations.TypedTuple<String>> data = z.reverseRangeWithScores(zkey, 0, Math.max(0, limit - 1));
        if (data == null || data.isEmpty()) return List.of();

        List<RankingItemResponse> out = new ArrayList<>();
        for (ZSetOperations.TypedTuple<String> t : data) {
            String memberIdStr = t.getValue();
            if (memberIdStr == null) continue;
            Long mid = Long.valueOf(memberIdStr);

            String userKey = hUser(d, mid);
            String nick = hash.get(userKey, "nickname");
            Integer total = parseInt(hash.get(userKey, "total"));
            Integer orig = parseInt(hash.get(userKey, "original"));

            double pct = increasePct(orig, total);

            RankingItemResponse dto = RankingItemResponse.builder()
                    .memberId(mid)
                    .nickname(nick)
                    .totalScore(total)
                    .originalTotalScore(orig)
                    .increasePercent(pct)
                    .build();
            out.add(dto);
        }
        return out;
    }

    private RankingItemResponse withTotalRank(RankingItemResponse d, int rank) {
        return RankingItemResponse.builder()
                .memberId(d.memberId())
                .nickname(d.nickname())
                .totalScore(d.totalScore())
                .originalTotalScore(d.originalTotalScore())
                .totalRank(rank)
                .originalRank(d.originalRank())
                .increaseRank(d.increaseRank())
                .increasePercent(d.increasePercent())
                .build();
    }

    private RankingItemResponse withOriginalRank(RankingItemResponse d, int rank) {
        return RankingItemResponse.builder()
                .memberId(d.memberId())
                .nickname(d.nickname())
                .totalScore(d.totalScore())
                .originalTotalScore(d.originalTotalScore())
                .totalRank(d.totalRank())
                .originalRank(rank)
                .increaseRank(d.increaseRank())
                .increasePercent(d.increasePercent())
                .build();
    }

    private RankingItemResponse withIncreaseRank(RankingItemResponse d, int rank) {
        return RankingItemResponse.builder()
                .memberId(d.memberId())
                .nickname(d.nickname())
                .totalScore(d.totalScore())
                .originalTotalScore(d.originalTotalScore())
                .totalRank(d.totalRank())
                .originalRank(d.originalRank())
                .increaseRank(rank) // ⬅️ 증가율 랭크 세팅
                .increasePercent(d.increasePercent())
                .build();
    }

    private Integer parseInt(String s) {
        if (s == null) return null;
        try { return Integer.valueOf(s); } catch (Exception e) { return null; }
    }

    private double increasePct(Integer original, Integer total) {
        if (original == null || total == null) return 0.0;
        int denom = Math.max(1, original);
        return ((double) (total - original)) * 100.0 / denom;
    }
}
