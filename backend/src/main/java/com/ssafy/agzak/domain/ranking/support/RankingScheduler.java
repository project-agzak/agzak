package com.ssafy.agzak.domain.ranking.support;

import com.ssafy.agzak.domain.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class RankingScheduler {

    private final RankingService rankingService;

    /** 매 시간 59분 55초 (KST) */
    @Scheduled(cron = "55 59 * * * *", zone = "Asia/Seoul")
    @SchedulerLock(name = "rankingSnapshot", lockAtMostFor = "PT4M", lockAtLeastFor = "PT20S")
    public void todayRebuild() {
        rankingService.rebuildTodaySnapshot();
    }

    /** 매 시간 55분 (KST) - Redis 리씨드 */
    @Scheduled(cron = "0 55 * * * *", zone = "Asia/Seoul")
    @SchedulerLock(name = "rankingReseed", lockAtMostFor = "PT4M", lockAtLeastFor = "PT10S")
    public void hourlyReseedRedis() {
        rankingService.reseedRedisFromMysqlToday();
    }
}

