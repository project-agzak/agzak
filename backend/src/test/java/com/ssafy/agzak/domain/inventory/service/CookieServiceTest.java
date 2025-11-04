package com.ssafy.agzak.domain.inventory.service;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CookieServiceTest {

    @InjectMocks
    private CookieService cookieService;


    @Mock private FortuneRepository fortuneRepository;
    @Mock private FortuneAspectRepository fortuneAspectRepository;
    @Mock private FortuneCookieRepository fortuneCookieRepository;

    private Fortune fortune;
    private List<FortuneAspect> aspects;
    private FortuneCookie cookie;

    private List<FortuneCookie> sampleCookies;

    @BeforeEach
    void setUp() {
        sampleCookies = List.of(
                FortuneCookie.builder()
                        .fortuneCookieId(1L)
                        .type(FortuneCookie.CookieType.LOVE)
                        .love(10).money(20).achievement(30).health(40)
                        .status(FortuneCookie.CookieStatus.AVAILABLE)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build(),
                FortuneCookie.builder()
                        .fortuneCookieId(2L)
                        .type(FortuneCookie.CookieType.MONEY)
                        .love(5).money(10).achievement(15).health(20)
                        .status(FortuneCookie.CookieStatus.AVAILABLE)
                        .createdAt(LocalDateTime.now().minusHours(1))
                        .build(),
                FortuneCookie.builder()
                        .fortuneCookieId(3L)
                        .type(FortuneCookie.CookieType.ACHIEVEMENT)
                        .love(15).money(15).achievement(10).health(10)
                        .status(FortuneCookie.CookieStatus.AVAILABLE)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build());


        // 오늘 운세 (총점 200 가정)
        Member member = Member.builder()
                .memberId(10L)
                .email("test@naver.com")
                .nickname("테스터")
                .status(Member.MemberStatus.ACTIVE)
                .build();

        FortuneType fortuneType = FortuneType.builder()
                .fortuneTypeId(1L)
                .build();

        fortune = new Fortune(member, fortuneType, "운세", 200);

        // 세부 항목: MONEY 40, LOVE 50, ACHIEVEMENT 60, HEALTH 50
        aspects = List.of(
                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.MONEY).score(40).build(),
                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.LOVE).score(50).build(),
                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.ACHIEVEMENT).score(60).build(),
                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.HEALTH).score(50).build()
        );

        // 먹을 쿠키: love +20, money -10, achievement +5, health +0
        cookie = FortuneCookie.builder()
                .fortuneCookieId(99L)
                .inventory(Inventory.builder().inventoryId(7L).build())
                .type(FortuneCookie.CookieType.MIXED)
                .love(20).money(-10).achievement(5).health(0)
                .status(FortuneCookie.CookieStatus.AVAILABLE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void useCookie() {
    }

    @Test
    @DisplayName("최신순 정렬")
    void sortByRecent() {
        when(fortuneCookieRepository.findAllByMember(1L))
                .thenReturn(sampleCookies);

        List<CookieResponse> result = cookieService.getFortuneCookie(1L, "recent");

        // createdAt 기준 최신순 (2 → 1 → 3)
        assertThat(result).extracting(CookieResponse::fortuneCookieId)
                .containsExactly(2L, 1L, 3L);
    }


    @Test
    @DisplayName("점수 내림차순 정렬")
    void sortByScore() {
        when(fortuneCookieRepository.findAllByMember(1L))
                .thenReturn(sampleCookies);

        List<CookieResponse> result = cookieService.getFortuneCookie(1L, "score");

        assertThat(result).extracting(cookieResponse -> cookieResponse.achievement() + cookieResponse.health()
                        + cookieResponse.love() + cookieResponse.money())
                .isSortedAccordingTo(Comparator.reverseOrder());
    }

    @Test
    @DisplayName("sortType = category → type 가나다순 정렬")
    void sortByCategory() {
        when(fortuneCookieRepository.findAllByMember(1L))
                .thenReturn(sampleCookies);

        List<CookieResponse> result = cookieService.getFortuneCookie(1L, "category");

        // ACHIEVEMENT → LOVE → MONEY
        assertThat(result).extracting(cookieResponse -> cookieResponse.type())
                .containsExactly("ACHIEVEMENT", "LOVE", "MONEY");
    }

    @Test
    @DisplayName("쿠키를 사용하면 각 Aspect 점수 가산, 쿠키 상태 USED, 총점 가산")
    void useCookie_success() {
        // given
        Long memberId = 1L;
        Long cookieId = 99L;

        given(fortuneRepository.findByMember_MemberIdAndDate(memberId, LocalDate.now()))
                .willReturn(Optional.of(fortune));
        given(fortuneAspectRepository.findAllByFortune(fortune))
                .willReturn(aspects);
        given(fortuneCookieRepository.findById(cookieId))
                .willReturn(Optional.of(cookie));

        int deltaTotal = cookie.getTotalScore(); // 20 + (-10) + 5 + 0 = 15

        // when
        cookieService.useCookie(memberId, cookieId);

        // then: 각 항목 점수 가산
        // MONEY: 40 + (-10) = 30
        assertThat(get(aspects, FortuneAspect.AspectName.MONEY).getScore()).isEqualTo(30);
        // LOVE: 50 + 20 = 70
        assertThat(get(aspects, FortuneAspect.AspectName.LOVE).getScore()).isEqualTo(70);
        // ACHIEVEMENT: 60 + 5 = 65
        assertThat(get(aspects, FortuneAspect.AspectName.ACHIEVEMENT).getScore()).isEqualTo(65);
        // HEALTH: 50 + 0 = 50
        assertThat(get(aspects, FortuneAspect.AspectName.HEALTH).getScore()).isEqualTo(50);

        // 쿠키 상태 USED
        assertThat(cookie.getStatus()).isEqualTo(FortuneCookie.CookieStatus.USED);

        // 총점 가산
        assertThat(fortune.getTotalScore()).isEqualTo(200 + deltaTotal);

        // 저장 호출은 안 해도 됨(더티체킹) — 호출 유무를 굳이 검증하고 싶다면 아래처럼도 가능
        verify(fortuneAspectRepository, never()).saveAll(anyList());
        verify(fortuneCookieRepository, never()).save(any());
        verify(fortuneRepository, never()).save(any());
    }

    @Test
    @DisplayName("오늘 운세가 없으면 NoFortuneFoundException")
    void useCookie_noFortune() {
        // given
        given(fortuneRepository.findByMember_MemberIdAndDate(anyLong(), any()))
                .willReturn(Optional.empty());

        // when/then
        assertThatThrownBy(() -> cookieService.useCookie(1L, 99L))
                .isInstanceOf(NoFortuneFoundException.class);
    }

    @Test
    @DisplayName("쿠키 ID가 없으면 IllegalArgumentException")
    void useCookie_invalidCookieId() {
        // given
        given(fortuneRepository.findByMember_MemberIdAndDate(anyLong(), any()))
                .willReturn(Optional.of(fortune));
        given(fortuneAspectRepository.findAllByFortune(fortune))
                .willReturn(aspects);
        given(fortuneCookieRepository.findById(anyLong()))
                .willReturn(Optional.empty());

        // when/then
        assertThatThrownBy(() -> cookieService.useCookie(1L, 404L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("유효하지 않은 쿠키 아이디");
    }

    private FortuneAspect get(List<FortuneAspect> list, FortuneAspect.AspectName name) {
        return list.stream().filter(a -> a.getName() == name).findFirst().orElseThrow();
    }
}