package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestFortuneService {

    private final FortuneAiService fortuneAiService;
    private final CacheManager cacheManager;

    private static final String FORTUNE_CACHE_NAME = "fortuneCache";

    public FinalFortuneResponse getGuestFortune(BirthDataInput input, String city) {

        Cache cache = cacheManager.getCache(FORTUNE_CACHE_NAME);
        String cacheKey = generateCacheKey(input, city);

        if (cache != null) {
            FinalFortuneResponse cachedResponse = cache.get(cacheKey, FinalFortuneResponse.class);
            if (cachedResponse != null) {
                log.debug("GUEST Cache Hit: {}", cacheKey);
                return cachedResponse;
            }
        }

        log.debug("GUEST Cache Miss: {}. AI 운세 생성을 시작합니다.", cacheKey);

        FinalFortuneResponse finalFortuneResponse = fortuneAiService.getFortuneScores(input, city);

        if (cache != null) {
            cache.put(cacheKey, finalFortuneResponse);
            log.debug("GUEST Cache WRITE from AI. key: {}", cacheKey);
        }

        return finalFortuneResponse;
    }

    private String generateCacheKey(BirthDataInput input, String city) {
        return "guest:" + input.birthDate() + "T" + input.birthTime() + "::" + city;
    }
}