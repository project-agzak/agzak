package com.ssafy.agzak.domain.inventory.service;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CookieServiceTest {

    @InjectMocks
    private CookieService cookieService;

    @Mock
    private FortuneCookieRepository fortuneCookieRepository;

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
}