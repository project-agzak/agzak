package com.ssafy.agzak.domain.inventory.service;

import com.ssafy.agzak.domain.inventory.entity.CookieDailyUsage;
import com.ssafy.agzak.domain.inventory.exception.DailyCookieUseExceededException;
import com.ssafy.agzak.domain.inventory.repository.CookieDailyUsageRepository;
import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DailyCookieUseService {

    private static final int DAILY_LIMIT = 50;

    private final CookieDailyUsageRepository usageRepository;
    private final DateProvider date;

    /**
     * 오늘 사용량을 1 증가시키되, 증가 후 값이 LIMIT를 초과하면 예외.
     * - 동일 트랜잭션 내에서 호출되어야 롤백 시 카운트도 롤백됨.
     */
    @Transactional
    public void increaseOrThrow(Long memberId) {
        var today = date.today();
        var todayTime = date.todayTime();
        var usage = usageRepository.findForUpdate(memberId, today)
                .orElseGet(() ->
                        usageRepository.save(CookieDailyUsage.builder()
                                .memberId(memberId)
                                .date(today)
                                .usedCount(0)
                                .updatedAt(todayTime)
                                .build())
                );

        if (usage.getUsedCount() >= DAILY_LIMIT) {
            throw new DailyCookieUseExceededException(memberId, DAILY_LIMIT);
        }
        usage.increase(todayTime);
    }
}
