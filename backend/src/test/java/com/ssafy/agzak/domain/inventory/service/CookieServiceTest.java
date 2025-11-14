//package com.ssafy.agzak.domain.inventory.service;
//
//import com.ssafy.agzak.domain.fortune.entity.Fortune;
//import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
//import com.ssafy.agzak.domain.fortune.entity.FortuneType;
//import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
//import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
//import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
//import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
//import com.ssafy.agzak.domain.inventory.entity.Inventory;
//import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
//import com.ssafy.agzak.domain.member.entity.Member;
//import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
//import com.ssafy.agzak.domain.ranking.service.RankingService;
//import com.ssafy.agzak.global.time.DateProvider;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.ZoneId;
//import java.util.Comparator;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.anyList;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class CookieServiceTest {
//
//    private CookieService cookieService;
//
//    @Mock private FortuneRepository fortuneRepository;
//    @Mock private FortuneAspectRepository fortuneAspectRepository;
//    @Mock private FortuneCookieRepository fortuneCookieRepository;
//    @Mock private RankingService rankingService;
//    @Mock private DateProvider date;
//
//    private Fortune fortune;
//    private List<FortuneAspect> aspects;
//    private FortuneCookie cookie;
//    private List<FortuneCookie> sampleCookies;
//
//    private final LocalDate FIXED_TODAY = LocalDate.of(2025, 1, 1);
//
//    @BeforeEach
//    void setUp() {
//        cookieService = new CookieService(
//                fortuneCookieRepository,
//                fortuneRepository,
//                fortuneAspectRepository,
//                rankingService,
//                date
//        );
//
//        lenient().when(date.today()).thenReturn(FIXED_TODAY);
//
//        sampleCookies = List.of(
//                FortuneCookie.builder()
//                        .fortuneCookieId(1L)
//                        .type(FortuneCookie.CookieType.LOVE)
//                        .love(10).money(20).achievement(30).health(40)
//                        .status(FortuneCookie.CookieStatus.AVAILABLE)
//                        .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")).minusDays(1))
//                        .build(),
//                FortuneCookie.builder()
//                        .fortuneCookieId(2L)
//                        .type(FortuneCookie.CookieType.MONEY)
//                        .love(5).money(10).achievement(15).health(20)
//                        .status(FortuneCookie.CookieStatus.AVAILABLE)
//                        .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")).minusHours(1))
//                        .build(),
//                FortuneCookie.builder()
//                        .fortuneCookieId(3L)
//                        .type(FortuneCookie.CookieType.ACHIEVEMENT)
//                        .love(15).money(15).achievement(10).health(10)
//                        .status(FortuneCookie.CookieStatus.AVAILABLE)
//                        .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")).minusDays(2))
//                        .build()
//        );
//
//        Member member = Member.builder()
//                .memberId(10L)
//                .email("test@naver.com")
//                .nickname("테스터")
//                .status(Member.MemberStatus.ACTIVE)
//                .build();
//
//        FortuneType fortuneType = FortuneType.builder()
//                .fortuneTypeId(1L)
//                .build();
//
//        fortune = Fortune.builder()
//                .member(member)
//                .fortuneType(fortuneType)
//                .date(FIXED_TODAY)
//                .description("운세")
//                .originalTotalScore(200)
//                .totalScore(200)
//                .build();
//
//        aspects = List.of(
//                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.MONEY).score(40).build(),
//                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.LOVE).score(50).build(),
//                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.ACHIEVEMENT).score(60).build(),
//                FortuneAspect.builder().fortune(fortune).name(FortuneAspect.AspectName.HEALTH).score(50).build()
//        );
//
//        cookie = FortuneCookie.builder()
//                .fortuneCookieId(99L)
//                .inventory(Inventory.builder().inventoryId(7L).build())
//                .type(FortuneCookie.CookieType.MIXED)
//                .love(20).money(-10).achievement(5).health(0)
//                .status(FortuneCookie.CookieStatus.AVAILABLE)
//                .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
//                .build();
//    }
//
//    @Test
//    @DisplayName("최신순 정렬")
//    void sortByRecent() {
//        when(fortuneCookieRepository.findAllByMember(1L))
//                .thenReturn(sampleCookies);
//
//        List<CookieResponse> result = cookieService.getFortuneCookie(1L, "recent");
//
//        assertThat(result).extracting(CookieResponse::fortuneCookieId)
//                .containsExactly(2L, 1L, 3L);
//    }
//
//    @Test
//    @DisplayName("점수 내림차순 정렬")
//    void sortByScore() {
//        when(fortuneCookieRepository.findAllByMember(1L))
//                .thenReturn(sampleCookies);
//
//        List<CookieResponse> result = cookieService.getFortuneCookie(1L, "score");
//
//        assertThat(result).extracting(r -> r.achievement() + r.health() + r.love() + r.money())
//                .isSortedAccordingTo(Comparator.reverseOrder());
//    }
//
//    @Test
//    @DisplayName("sortType = category → type 가나다순 정렬")
//    void sortByCategory() {
//        when(fortuneCookieRepository.findAllByMember(1L))
//                .thenReturn(sampleCookies);
//
//        List<CookieResponse> result = cookieService.getFortuneCookie(1L, "category");
//
//        assertThat(result).extracting(CookieResponse::type)
//                .containsExactly("ACHIEVEMENT", "LOVE", "MONEY");
//    }
//
//    @Test
//    @DisplayName("쿠키를 사용하면 각 Aspect 점수 가산, 쿠키 상태 USED, 총점 가산")
//    void useCookie_success() {
//        Long memberId = 1L;
//        Long cookieId = 99L;
//
//        given(fortuneRepository.findByMember_MemberIdAndDate(memberId, FIXED_TODAY))
//                .willReturn(Optional.of(fortune));
//        given(fortuneAspectRepository.findAllByFortune(fortune))
//                .willReturn(aspects);
//        given(fortuneCookieRepository.findById(cookieId))
//                .willReturn(Optional.of(cookie));
//
//        int deltaTotal = cookie.getTotalScore();
//
//        cookieService.useCookie(memberId, cookieId);
//
//        assertThat(get(aspects, FortuneAspect.AspectName.MONEY).getScore()).isEqualTo(30);
//        assertThat(get(aspects, FortuneAspect.AspectName.LOVE).getScore()).isEqualTo(70);
//        assertThat(get(aspects, FortuneAspect.AspectName.ACHIEVEMENT).getScore()).isEqualTo(65);
//        assertThat(get(aspects, FortuneAspect.AspectName.HEALTH).getScore()).isEqualTo(50);
//
//        assertThat(cookie.getStatus()).isEqualTo(FortuneCookie.CookieStatus.USED);
//        assertThat(fortune.getTotalScore()).isEqualTo(200 + deltaTotal);
//
//        verify(fortuneAspectRepository, never()).saveAll(anyList());
//        verify(fortuneCookieRepository, never()).save(any());
//        verify(fortuneRepository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("오늘 운세가 없으면 NoFortuneFoundException")
//    void useCookie_noFortune() {
//        given(fortuneRepository.findByMember_MemberIdAndDate(anyLong(), any(LocalDate.class)))
//                .willReturn(Optional.empty());
//
//        assertThatThrownBy(() -> cookieService.useCookie(1L, 99L))
//                .isInstanceOf(NoFortuneFoundException.class);
//    }
//
//    @Test
//    @DisplayName("쿠키 ID가 없으면 IllegalArgumentException")
//    void useCookie_invalidCookieId() {
//        given(fortuneRepository.findByMember_MemberIdAndDate(anyLong(), eq(FIXED_TODAY)))
//                .willReturn(Optional.of(fortune));
//        given(fortuneAspectRepository.findAllByFortune(fortune))
//                .willReturn(aspects);
//        given(fortuneCookieRepository.findById(anyLong()))
//                .willReturn(Optional.empty());
//
//        assertThatThrownBy(() -> cookieService.useCookie(1L, 404L))
//                .isInstanceOf(IllegalArgumentException.class)
//                .hasMessageContaining("유효하지 않은 쿠키 아이디");
//    }
//
//    private FortuneAspect get(List<FortuneAspect> list, FortuneAspect.AspectName name) {
//        return list.stream().filter(a -> a.getName() == name).findFirst().orElseThrow();
//    }
//}
