package com.ssafy.agzak.domain.ranking.scheduler;

import com.ssafy.agzak.domain.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class RankingScheduler {

    private final RankingService rankingService;

    /** 매 시간 정각에 오늘 랭킹 Redis와 MySQL 스냅샷 갱신 (KST) */
//    @Scheduled(cron = "0 */1 * * * *", zone = "Asia/Seoul")
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    @Transactional
    public void hourlyRebuild() {
        rankingService.rebuildTodayRedisAndSnapshot();
    }
}
