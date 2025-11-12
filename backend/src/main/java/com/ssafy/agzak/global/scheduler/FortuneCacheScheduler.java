package com.ssafy.agzak.global.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
public class FortuneCacheScheduler {

    //KST(Asia/Seoul) 기준 매일 0시 0분 0초에 이 메서드를 실행합니다.
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @CacheEvict(value = "fortuneCache", allEntries = true)
    public void evictFortuneCacheAtMidnight() {
        log.info("KST 자정: 'fortuneCache'의 모든 운세 캐시를 삭제합니다.");
    }
}
