package com.ssafy.agzak.domain.ranking.support;

import com.ssafy.agzak.domain.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class RankingScheduler {

    private final RankingService rankingService;

    /** 매 시간 정각(KST) */
    @Scheduled(cron = "0 59 * * * *", zone = "Asia/Seoul")
    public void hourlyRebuild() {
        rankingService.rebuildTodaySnapshot();
    }

    /** 매 시간 30분(KST) - Redis 리씨드 */
    @Scheduled(cron = "0 58 * * * *", zone = "Asia/Seoul")
    public void hourlyReseedRedis() {
        rankingService.reseedRedisFromMysqlToday();
    }
}

