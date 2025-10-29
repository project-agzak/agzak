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
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void hourlyRebuild() {
        rankingService.rebuildTodaySnapshot();
    }
}

