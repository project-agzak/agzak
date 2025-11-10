package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FortuneService {
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final GuestProfileStore guestStore;
    private final DateProvider date;
    private final FortuneAiService fortuneAiService;
    private final FortuneWriter fortuneWriter;

    private final CacheManager cacheManager;
    private static final String FORTUNE_CACHE_NAME = "fortuneCache";

    public FinalFortuneResponse getMemberFortune(long memberId, BirthDataInput input, String city) {
        Cache cache = cacheManager.getCache(FORTUNE_CACHE_NAME);
        String cacheKey = generateCacheKey(input, city);

        if (cache != null) {
            FinalFortuneResponse cachedResponse = cache.get(cacheKey, FinalFortuneResponse.class);
            if (cachedResponse != null) {
                log.debug("Cache Hit: {} 키의 운세 정보를 캐시에서 반환합니다.", cacheKey);
                return cachedResponse;
            }
        }
        log.debug("Cache Miss: {} 키의 운세 정보를 DB에서 조회합니다.", cacheKey);

        Optional<Fortune> fortuneOpt = fortuneRepository.findByMember_MemberIdAndDate(memberId, date.today());
        if (fortuneOpt.isPresent()) {
            Fortune fortune = fortuneOpt.get();
            List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);
            FinalFortuneResponse response = FinalFortuneResponse.fromEntity(fortune, fortuneAspects);

            if (cache != null) {
                cache.put(cacheKey, response);
            }

            return response;

        } else {
            FinalFortuneResponse finalFortuneResponse = fortuneAiService.getFortuneScores(input, city);
            fortuneWriter.saveFortune(memberId, finalFortuneResponse);

            if (cache != null) {
                cache.put(cacheKey, finalFortuneResponse);
            }

            return finalFortuneResponse;
        }
    }

    private String generateCacheKey(BirthDataInput input, String city) {
        return "getFortuneScores:" + input.birthDate() + "T" + input.birthTime() + "::" + city;
    }


    @Transactional
    public String saveGuestProfile(GuestProfile profile) {
        return guestStore.save(profile);
    }

}
