package com.ssafy.agzak.domain.inventory.service;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import com.ssafy.agzak.global.time.DateProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

import static com.ssafy.agzak.global.tx.TxAfterCommit.afterCommit;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CookieService {
    private final FortuneCookieRepository fortuneCookieRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final RankingService rankingService;
    private final DateProvider date;
    private final DailyCookieUseService dailyCookieUseService;

    public CookieResponse getCookieInfo(Long cookieId) {
        FortuneCookie cookie = fortuneCookieRepository.findById(cookieId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠키 아이디입니다."));
        // FK 기반으로 DTO 구성
        return CookieResponse.fromEntity(cookie);
    }

    @Transactional
    public void useCookie(Long memberId, Long cookieId) {
        Fortune fortune = fortuneRepository.findByMember_MemberIdAndDate(memberId, date.today())
                .orElseThrow(() -> new NoFortuneFoundException("오늘 운세가 존재하지 않습니다.", memberId, date.today()));
        List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);

        FortuneCookie cookie = fortuneCookieRepository.findByIdForUpdate(cookieId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠키 아이디입니다."));

        Long ownerId = cookie.getInventory().getMember().getMemberId();
        if (!ownerId.equals(memberId)) {
            throw new IllegalArgumentException("본인 소유의 쿠키만 사용할 수 있습니다.");
        }
        if (cookie.getStatus() != FortuneCookie.CookieStatus.AVAILABLE) {
            throw new IllegalArgumentException("사용할 수 없는 상태의 쿠키입니다.");
        }

        dailyCookieUseService.increaseOrThrow(memberId);

        final int CAP = 250;
        int appliedSum = 0;
        for (FortuneAspect aspect : fortuneAspects) {
            switch (aspect.getName()) {
                case MONEY       -> appliedSum += aspect.increaseWithUpperCap(cookie.getMoney(), CAP);
                case LOVE        -> appliedSum += aspect.increaseWithUpperCap(cookie.getLove(), CAP);
                case ACHIEVEMENT -> appliedSum += aspect.increaseWithUpperCap(cookie.getAchievement(), CAP);
                case HEALTH      -> appliedSum += aspect.increaseWithUpperCap(cookie.getHealth(), CAP);
            }
        }

        cookie.markUsed();
        fortune.updateScore(appliedSum);
        afterCommit(() -> rankingService.refreshTodayForMember(memberId));
    }

    public List<CookieResponse> getFortuneCookie(Long memberId, String sortType) {
        List<FortuneCookie> cookies = fortuneCookieRepository.findAllByMember(memberId);
        return switch (sortType.toLowerCase()) {
            case "score" -> cookies.stream()
                    .sorted(Comparator.comparingInt(FortuneCookie::getTotalScore).reversed())
                    .map(CookieResponse::fromEntity)
                    .toList();

            case "kind" -> cookies.stream()
                    .sorted(Comparator
                            .comparing((FortuneCookie fc) ->
                                    fc.getCookieKind() != null && fc.getCookieKind().getRarity() != null
                                            ? fc.getCookieKind().getRarity().getSortOrder() : Integer.MAX_VALUE)
                            .thenComparing(fc -> fc.getCookieKind() != null ? fc.getCookieKind().getCode() : ""))
                    .map(CookieResponse::fromEntity)
                    .toList();

            default -> cookies.stream()
                    .sorted(Comparator.comparing(FortuneCookie::getCreatedAt).reversed())
                    .map(CookieResponse::fromEntity)
                    .toList();
        };
    }

    @Transactional
    public void deleteCookie(Long memberId, Long cookieId) {
        FortuneCookie cookie = fortuneCookieRepository.findById(cookieId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠키 아이디입니다."));
        Long ownerId = cookie.getInventory().getMember().getMemberId();
        if (!ownerId.equals(memberId)) throw new IllegalArgumentException("본인 소유의 쿠키만 삭제할 수 있습니다.");
        if (cookie.getStatus() != FortuneCookie.CookieStatus.AVAILABLE)
            throw new IllegalStateException("해당 상태의 쿠키는 삭제할 수 없습니다.");

        cookie.markDeleted();
    }
}