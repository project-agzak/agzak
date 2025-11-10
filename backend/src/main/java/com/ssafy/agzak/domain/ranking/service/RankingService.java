 package com.ssafy.agzak.domain.ranking.service;

 import com.ssafy.agzak.domain.fortune.entity.Fortune;
 import com.ssafy.agzak.domain.member.entity.Member;
 import com.ssafy.agzak.domain.ranking.dto.MyRankDto;
 import com.ssafy.agzak.domain.ranking.dto.RankingItemDto;
 import com.ssafy.agzak.domain.ranking.dto.RankingListDto;
 import com.ssafy.agzak.domain.ranking.entity.Ranking;
 import com.ssafy.agzak.domain.ranking.support.MysqlRankingStore;
 import com.ssafy.agzak.domain.ranking.support.RankCalculator;
 import com.ssafy.agzak.domain.ranking.support.RedisRankingStore;
 import lombok.RequiredArgsConstructor;
 import lombok.extern.slf4j.Slf4j;
 import org.springframework.stereotype.Service;
 import org.springframework.transaction.annotation.Transactional;

 import java.time.LocalDate;
 import java.util.*;
 import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private final RedisRankingStore redisStore;
    private final MysqlRankingStore mysqlStore;

    /**
     * MySQL의 오늘 fortune → Redis에 리씨드
     * - Redis가 죽어있으면 NPE/Conn 에러 등 발생 가능하니 try/catch
     * - 비교 기준: ZCARD(total) vs MySQL 행 수. 차이나면 리씨드
     */
    @Transactional
    public void reseedRedisFromMysqlToday() {
        LocalDate today = redisStore.today();
        var fortunes = mysqlStore.fortunes(today);

        // MySQL이 비어있으면 Redis 비움(선택) or noop
        if (fortunes.isEmpty()) return;

        // Redis 상태/규모 확인
        Long zcard = redisStore.zcard(redisStore.zTotal(today));
        boolean needsReseed = (zcard == null) || (zcard.intValue() != fortunes.size());

        // 필요 없으면 스킵 (옵션)
        if (!needsReseed) return;

        // 변환 후 일괄 업서트
        List<RedisRankingStore.UserRow> rows = fortunes.stream()
                .map(f -> new RedisRankingStore.UserRow(
                        f.getMember().getMemberId(),
                        f.getMember().getNickname(),
                        f.getTotalScore(),
                        f.getOriginalTotalScore()
                ))
                .toList();

        try {
            redisStore.bulkUpsertTodayUsers(rows);
        } catch (Exception e) {
            log.warn("Redis reseed failed: {}", e.getMessage());
        }
    }

    // ===== 읽기: 오늘(REDIS) =====
    public RankingListDto getTodayTopN(int limit) {
        LocalDate d = redisStore.today();
        try {
            var total    = redisStore.readTop(d, redisStore.zTotal(d),    limit);
            var original = redisStore.readTop(d, redisStore.zOriginal(d), limit);
            var gain     = redisStore.readTop(d, redisStore.zGain(d),     limit);

            if ((total == null || total.isEmpty()) &&
                    (original == null || original.isEmpty()) &&
                    (gain == null || gain.isEmpty())) {
                // Redis 비어있음 → MySQL 스냅샷 fallback
                return getSnapshotTopN(d, limit);
            }

            var totalDtos = fillRanks(Objects.requireNonNull(total));
            var origDtos  = fillRanks(Objects.requireNonNull(original));
            var gainDtos  = fillRanks(gain);
            setListRanks(totalDtos, RankBasis.TOTAL);
            setListRanks(origDtos,  RankBasis.ORIGINAL);
            setListRanks(gainDtos,  RankBasis.GAIN);

            return RankingListDto.builder()
                    .date(d)
                    .totalLeaderboard(totalDtos)
                    .originalLeaderboard(origDtos)
                    .increaseLeaderboard(gainDtos)
                    .build();
        } catch (Exception e) {
            // Redis 접속 오류 → MySQL 스냅샷 fallback
            return getSnapshotTopN(d, limit);
        }
    }

    // ===== 읽기: 과거일자(MYSQL) =====
    public RankingListDto getSnapshotTopN(LocalDate date, int limit) {
        var fortunes = mysqlStore.fortunes(date);
        if (fortunes.isEmpty()) {
            return RankingListDto.builder()
                    .date(date)
                    .totalLeaderboard(List.of())
                    .originalLeaderboard(List.of())
                    .increaseLeaderboard(List.of())
                    .build();
        }
        // 공통 리스트 만들기
        var items = fortunes.stream().map(f -> {
            var inc = RankCalculator.increasePct(f.getOriginalTotalScore(), f.getTotalScore());
            return RankingItemDto.builder()
                    .memberId(f.getMember().getMemberId())
                    .nickname(f.getMember().getNickname())
                    .totalScore(f.getTotalScore())
                    .originalTotalScore(f.getOriginalTotalScore())
                    .increasePercent(inc)
                    .build();
        }).toList();

        // 각 기준별 정렬 후 상위 N + 리스트 내부 랭크 부여(경쟁랭킹)
        var topTotal = topWithRanks(items, RankBasis.TOTAL, limit);
        var topOrig  = topWithRanks(items, RankBasis.ORIGINAL, limit);
        var topGain  = topWithRanks(items, RankBasis.GAIN, limit);

        return RankingListDto.builder()
                .date(date)
                .totalLeaderboard(topTotal)
                .originalLeaderboard(topOrig)
                .increaseLeaderboard(topGain)
                .build();
    }

    @Transactional
    public void refreshTodayForMember(Long memberId) {
        LocalDate d = redisStore.today();
        var opt = mysqlStore.findFortune(d, memberId);
        if (opt.isEmpty()) {
            redisStore.removeTodayUser(memberId);
            return;
        }
        var f = opt.get();
        redisStore.upsertTodayUser(
                memberId,
                f.getMember().getNickname(),
                f.getTotalScore(),
                f.getOriginalTotalScore()
        );
    }

    // ===== 내 랭킹: 오늘(REDIS) =====
    public MyRankDto getMyToday(long memberId) {
        LocalDate d = redisStore.today();

        // 점수 읽기
        var rows = redisStore.readTop(d, redisStore.zTotal(d), Integer.MAX_VALUE); // 해시 채우기용
        var me = rows.stream().filter(r -> Objects.equals(r.memberId(), memberId)).findFirst().orElse(null);

        Integer total = me==null?null:me.total();
        Integer orig  = me==null?null:me.original();
        String nick   = me==null?null:me.nickname();
        double inc    = RankCalculator.increasePct(orig, total);

        Integer rTotal = redisStore.zrevRank1Base(redisStore.zTotal(d), memberId);
        Integer rOrig  = redisStore.zrevRank1Base(redisStore.zOriginal(d), memberId);
        Integer rGain  = redisStore.zrevRank1Base(redisStore.zGain(d), memberId);

        return MyRankDto.builder()
                .date(d)
                .memberId(memberId)
                .nickname(nick)
                .totalScore(total)
                .originalTotalScore(orig)
                .increasePercent(inc)
                .totalRank(rTotal)
                .originalRank(rOrig)
                .increaseRank(rGain)
                .build();
    }

    // ===== 내 랭킹: 과거일자(MYSQL) =====
    public MyRankDto getMySnapshot(LocalDate date, long memberId) {
        var fortunes = mysqlStore.fortunes(date);
        if (fortunes.isEmpty()) {
            return MyRankDto.builder().date(date).memberId(memberId).increasePercent(0.0).build();
        }
        Map<Long, Fortune> byId = fortunes.stream()
                .collect(Collectors.toMap(f->f.getMember().getMemberId(), f->f));

        var me = byId.get(memberId);
        String nick = me==null?null:me.getMember().getNickname();
        Integer total = me==null?null:me.getTotalScore();
        Integer orig  = me==null?null:me.getOriginalTotalScore();
        double inc    = RankCalculator.increasePct(orig, total);

        // 경쟁랭킹 계산
        var totalRank = RankCalculator.competitionRank(
                fortunes.stream().map(Fortune::getTotalScore).toList(),
                total==null?Integer.MIN_VALUE:total
        );
        var origRank  = RankCalculator.competitionRank(
                fortunes.stream().map(Fortune::getOriginalTotalScore).toList(),
                orig==null?Integer.MIN_VALUE:orig
        );
        var gainRank  = RankCalculator.competitionRank(
                fortunes.stream().map(f->RankCalculator.increasePct(f.getOriginalTotalScore(), f.getTotalScore())).toList(),
                inc
        );

        return MyRankDto.builder()
                .date(date)
                .memberId(memberId)
                .nickname(nick)
                .totalScore(total)
                .originalTotalScore(orig)
                .increasePercent(inc)
                .totalRank(totalRank)
                .originalRank(origRank)
                .increaseRank(gainRank)
                .build();
    }

    // ===== 스냅샷 재생성(자정/시간별 배치용) =====
    @Transactional
    public void rebuildTodaySnapshot() {
        LocalDate today = redisStore.today();

        // 총점 기준 역정렬(내림차순)로 전원 로드
        var all = redisStore.readTop(today, redisStore.zTotal(today), Integer.MAX_VALUE);
        if (all == null || all.isEmpty()) {
            // 오늘자 스냅샷 비우기
            mysqlStore.replaceTodaySnapshot(today, List.of());
            return;
        }

        int rank = 1;
        List<Ranking> rows = new ArrayList<>(all.size());
        for (var r : all) {
            // Member 프록시 참조
            Member ref = mysqlStore.refMember(r.memberId());

            rows.add(Ranking.builder()
                    .member(ref)
                    .date(today)
                    .rankNo(rank++)                               // 총점 기준 1-base 순번
                    .totalScore(r.total())
                    .originalTotalScore(r.original())
                    .build());
        }

        // 오늘자 스냅샷 교체 저장
        mysqlStore.replaceTodaySnapshot(today, rows);
    }

    private enum RankBasis { TOTAL, ORIGINAL, GAIN }

    private List<RankingItemDto> fillRanks(List<RedisRankingStore.UserRow> rows){
        return rows.stream()
                .map(r -> RankingItemDto.builder()
                        .memberId(r.memberId())
                        .nickname(r.nickname())
                        .totalScore(r.total())
                        .originalTotalScore(r.original())
                        .increasePercent(RankCalculator.increasePct(r.original(), r.total()))
                        .build()
                )
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private void setListRanks(List<RankingItemDto> list, RankBasis basis) {
        for (int i=0;i<list.size();i++) {
            var d = list.get(i);
            var b = RankingItemDto.builder()
                    .memberId(d.memberId()).nickname(d.nickname())
                    .totalScore(d.totalScore()).originalTotalScore(d.originalTotalScore())
                    .increasePercent(d.increasePercent())
                    .totalRank(d.totalRank()).originalRank(d.originalRank()).increaseRank(d.increaseRank());
            int rank = i+1;
            switch (basis) {
                case TOTAL    -> b.totalRank(rank);
                case ORIGINAL -> b.originalRank(rank);
                case GAIN     -> b.increaseRank(rank);
            }
            list.set(i, b.build());
        }
    }

    private List<RankingItemDto> topWithRanks(List<RankingItemDto> items, RankBasis basis, int limit) {
        Comparator<RankingItemDto> cmp = switch (basis) {
            case TOTAL    -> Comparator.comparing(RankingItemDto::totalScore, Comparator.nullsLast(Comparator.naturalOrder())).reversed();
            case ORIGINAL -> Comparator.comparing(RankingItemDto::originalTotalScore, Comparator.nullsLast(Comparator.naturalOrder())).reversed();
            case GAIN     -> Comparator.comparing(RankingItemDto::increasePercent, Comparator.nullsLast(Comparator.naturalOrder())).reversed();
        };

        var sorted = items.stream().sorted(cmp).limit(limit).toList();

        return sorted.stream().map(d -> {
            Integer rank = switch (basis) {
                case TOTAL    -> RankCalculator.competitionRank(
                        sorted.stream().map(RankingItemDto::totalScore).toList(),
                        d.totalScore());
                case ORIGINAL -> RankCalculator.competitionRank(
                        sorted.stream().map(RankingItemDto::originalTotalScore).toList(),
                        d.originalTotalScore());
                case GAIN     -> RankCalculator.competitionRank(
                        sorted.stream().map(RankingItemDto::increasePercent).toList(),
                        d.increasePercent());
            };

            return RankingItemDto.builder()
                    .memberId(d.memberId()).nickname(d.nickname())
                    .totalScore(d.totalScore()).originalTotalScore(d.originalTotalScore())
                    .increasePercent(d.increasePercent())
                    .totalRank(basis==RankBasis.TOTAL?rank:d.totalRank())
                    .originalRank(basis==RankBasis.ORIGINAL?rank:d.originalRank())
                    .increaseRank(basis==RankBasis.GAIN?rank:d.increaseRank())
                    .build();
        }).toList();
    }
}
