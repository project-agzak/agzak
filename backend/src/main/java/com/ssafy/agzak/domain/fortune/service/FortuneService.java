package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
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
        Optional<Fortune> fortuneOpt = fortuneRepository.findByMember_MemberIdAndDate(memberId, date.today());

        if (fortuneOpt.isPresent()) {
            log.debug("DB Hit: Member {}. DB 데이터를 반환합니다.", memberId);
            Fortune fortune = fortuneOpt.get();
            List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);
            return FinalFortuneResponse.fromEntity(fortune, fortuneAspects);
        }

        log.debug("DB Miss: Member {}. AI 절약용 캐시(guestCache)를 확인합니다.", memberId);

        Cache cache = cacheManager.getCache(FORTUNE_CACHE_NAME);
        String guestCacheKey = generateGuestCacheKey(input, city);  //게스트일 때 조회한 값 조회 키
        FinalFortuneResponse finalFortuneResponse; // DB에 저장할 최종 운세

        if (cache != null) {
            FinalFortuneResponse guestCachedResponse = cache.get(guestCacheKey, FinalFortuneResponse.class);
            if (guestCachedResponse != null) {
                log.info("Guest Cache Hit for Member: {}. AI 호출을 건너뛰고 이 값으로 DB 저장을 진행합니다.", memberId);
                finalFortuneResponse = guestCachedResponse;
            } else {
                log.info("Total Miss (DB & Guest Cache). AI 운세 생성을 시작합니다: {}", memberId);
                finalFortuneResponse = fortuneAiService.getFortuneScores(input, city);
                cache.put(guestCacheKey, finalFortuneResponse);
            }
        } else {
            log.warn("Cache를 찾을 수 없어 AI를 직접 호출합니다. (key: {})", guestCacheKey);
            finalFortuneResponse = fortuneAiService.getFortuneScores(input, city);
        }

        fortuneWriter.saveFortune(memberId, finalFortuneResponse);

        return finalFortuneResponse;
    }

    private String generateGuestCacheKey(BirthDataInput input, String city) {
        return "guest:" + input.birthDate() + "T" + input.birthTime() + "::" + city;
    }

    @Transactional
    public String saveGuestProfile(GuestProfile profile) {
        return guestStore.save(profile);
    }


}
