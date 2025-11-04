package com.ssafy.agzak.domain.inventory.service;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CookieService {
    private final FortuneCookieRepository fortuneCookieRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;

    public CookieResponse getCookieInfo(Long cookieId) {
        FortuneCookie cookie = fortuneCookieRepository.findById(cookieId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠키 아이디입니다."));

        return CookieResponse.fromEntity(cookie);
    }

    @Transactional
    public void useCookie(Long memberId, Long cookieId) {
        Fortune fortune = fortuneRepository.findByMember_MemberIdAndDate(memberId, LocalDate.now())
                .orElseThrow(() -> new NoFortuneFoundException("오늘 운세가 존재하지 않습니다.", memberId, LocalDate.now()));
        List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);

        FortuneCookie cookie = fortuneCookieRepository.findById(cookieId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠키 아이디입니다."));

        for (FortuneAspect aspect : fortuneAspects) {
            switch  (aspect.getName().name()) {
                case "MONEY" -> aspect.updateScore(cookie.getMoney());
                case "LOVE" -> aspect.updateScore(cookie.getLove());
                case "ACHIEVEMENT" -> aspect.updateScore(cookie.getAchievement());
                case "HEALTH" -> aspect.updateScore(cookie.getHealth());
            }
        }

        cookie.updateStatus();
        int sum = cookie.getAchievement() + cookie.getMoney() + cookie.getHealth() + cookie.getLove();
        fortune.updateScore(sum);
    }

    public List<CookieResponse> getFortuneCookie(Long memberId, String sortType) {
        List<FortuneCookie> cookies = fortuneCookieRepository.findAllByMember(memberId);
        return switch (sortType.toLowerCase()) {
            case "score" -> cookies.stream()
                    .sorted(Comparator.comparingInt(FortuneCookie::getTotalScore).reversed())
                    .map(CookieResponse::fromEntity)
                    .toList();

            case "category" -> cookies.stream()
                    .sorted(Comparator.comparing(fortuneCookie -> fortuneCookie.getType().name(), Comparator.nullsLast(String::compareToIgnoreCase)))
                    .map(CookieResponse::fromEntity)
                    .toList();

            default -> cookies.stream()
                    .sorted(Comparator.comparing(FortuneCookie::getCreatedAt).reversed())
                    .map(CookieResponse::fromEntity)
                    .toList();
        };
    }

}
