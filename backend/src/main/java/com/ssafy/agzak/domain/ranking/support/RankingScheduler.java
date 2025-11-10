package com.ssafy.agzak.domain.ranking.support;

import com.ssafy.agzak.domain.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class RankingScheduler {

    private final RankingService rankingService;

    /** 매 시간 59분 50초 (KST) */
    @Scheduled(cron = "50 59 * * * *", zone = "Asia/Seoul")
    public void hourlyRebuild() {
        rankingService.rebuildTodaySnapshot();
    }

    /** 매 시간 59분 (KST) - Redis 리씨드 */
    @Scheduled(cron = "0 59 * * * *", zone = "Asia/Seoul")
    public void hourlyReseedRedis() {
        rankingService.reseedRedisFromMysqlToday();
    }
}

