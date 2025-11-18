package com.ssafy.agzak.domain.coupon.service;

import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponRequest;
import com.ssafy.agzak.domain.coupon.dto.response.CouponIssueResultResponse;
import com.ssafy.agzak.domain.coupon.entity.Coupon;
import com.ssafy.agzak.domain.coupon.entity.CouponType;
import com.ssafy.agzak.domain.coupon.entity.MemberCoupon;
import com.ssafy.agzak.domain.coupon.repository.CouponRepository;
import com.ssafy.agzak.domain.coupon.repository.CouponTypeRepository;
import com.ssafy.agzak.domain.coupon.repository.CustomCouponRepository;
import com.ssafy.agzak.domain.coupon.repository.MemberCouponRepository;
import com.ssafy.agzak.domain.coupon.util.ConcurrentFCSUtil;
import com.ssafy.agzak.domain.coupon.util.FCSUtil;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.LongStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;
    @Mock
    private CouponTypeRepository couponTypeRepository;
    @InjectMocks
    private CouponService couponService;
    @Mock
    private CreateCouponRequest createCouponRequest;
    @Mock
    private MemberCouponRepository memberCouponRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private CouponType couponType;
    @Mock
    private CustomCouponRepository customCouponRepository;
    @Mock
    private final ConcurrentFCSUtil fcsUtil = new ConcurrentFCSUtil();

    @Test
    void createCoupon_정상_생성() {
        // given
        Long couponTypeId = 1L;
        String description = "테스트 쿠폰";
        int totalQuantity = 10;

        when(createCouponRequest.couponTypeId()).thenReturn(couponTypeId);
        when(createCouponRequest.description()).thenReturn(description);
        when(createCouponRequest.totalQuantity()).thenReturn(totalQuantity);
        when(couponTypeRepository.getReferenceById(couponTypeId)).thenReturn(couponType);

        // when
        couponService.createCoupon(createCouponRequest);

        // then
        ArgumentCaptor<Coupon> captor = ArgumentCaptor.forClass(Coupon.class);
        verify(couponRepository).save(captor.capture());

        Coupon saved = captor.getValue();
        assertEquals(description, saved.getDescription());
        assertEquals(totalQuantity, saved.getTotalQuantity());
        assertEquals(couponType, saved.getCouponType());
    }

    @Test
    void expireCoupon_정상_만료() {
        // given
        Long couponId = 1L;
        Coupon coupon = mock(Coupon.class);
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));

        // when
        couponService.expireCoupon(couponId);

        // then
        verify(coupon).expire();
    }

    @Test
    void expireCoupon_존재하지_않는_쿠폰이면_예외() {
        // given
        Long couponId = 1L;
        when(couponRepository.findById(couponId)).thenReturn(Optional.empty());

        // when & then
        IllegalArgumentException e = assertThrows(
                IllegalArgumentException.class,
                () -> couponService.expireCoupon(couponId)
        );
        assertEquals("존재하지 않는 쿠폰입니다.", e.getMessage());
    }

    @Test
    void issueCoupon_정상_발급() {
        // given
        Long couponId = 1L;
        Long memberId = 1L;

        Coupon coupon = mock(Coupon.class);
        Member member = mock(Member.class);

        // 1) 쿠폰 조회 + 미만료 상태
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(coupon.getExpiresAt()).thenReturn(LocalDateTime.now().plusHours(1)); // 미래 → 만료 아님

        // 2) 순번 발급
        when(fcsUtil.nextOrder(couponId)).thenReturn(1L);

        // 3) 재고 1개 증가 성공
        when(customCouponRepository.updateCouponQuantity(couponId)).thenReturn(1L);

        // 4) save 에 사용할 레퍼런스
        when(couponRepository.getReferenceById(couponId)).thenReturn(coupon);
        when(memberRepository.getReferenceById(memberId)).thenReturn(member);

        // 5) save() 결과로 돌려줄 MemberCoupon (null 이면 NPE 나므로 반드시 스텁)
        MemberCoupon savedEntity = MemberCoupon.builder()
                .coupon(coupon)
                .member(member)
                .build();
        when(memberCouponRepository.save(any(MemberCoupon.class)))
                .thenReturn(savedEntity);

        // when
        CouponIssueResultResponse res = couponService.issueCoupon(couponId, memberId);

        // then
        // 재고 증가 쿼리 1번
        verify(customCouponRepository).updateCouponQuantity(couponId);

        // MemberCoupon 에 우리가 넘긴 coupon, member 가 들어갔는지
        ArgumentCaptor<MemberCoupon> captor = ArgumentCaptor.forClass(MemberCoupon.class);
        verify(memberCouponRepository).save(captor.capture());

        MemberCoupon saved = captor.getValue();
        assertThat(saved.getCoupon()).isEqualTo(coupon);
        assertThat(saved.getMember()).isEqualTo(member);

        // 응답도 성공이어야 함
        assertThat(res.isSuccess()).isTrue();
        assertThat(res.order()).isEqualTo(1L);
    }


    @Test
    void issueCoupon_수량초과시_실패응답을_반환한다() {
        // given
        Long couponId = 1L;
        Long memberId = 1L;

        Coupon coupon = mock(Coupon.class);

        // 1) 쿠폰은 존재하고, 만료도 안 됐다
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(coupon.getExpiresAt()).thenReturn(LocalDateTime.now().plusHours(1));

        // 2) 순번은 101번째라고 치자
        when(fcsUtil.nextOrder(couponId)).thenReturn(101L);

        // 3) 재고 없음 → update 된 row 수 0
        when(customCouponRepository.updateCouponQuantity(couponId)).thenReturn(0L);

        // when
        CouponIssueResultResponse res = couponService.issueCoupon(couponId, memberId);

        // then
        assertThat(res.isSuccess()).isFalse();
        assertThat(res.order()).isEqualTo(101L);

        // 발급 실패이므로 MemberCoupon 저장은 없어야 함
        verify(memberCouponRepository, never()).save(any());
    }

    @Test
    void issueCoupon_존재하지_않는_쿠폰이면_예외() {
        // given
        Long couponId = 1L;
        Long memberId = 1L;

        when(couponRepository.findById(couponId)).thenReturn(Optional.empty());

        // when & then
        IllegalArgumentException e = assertThrows(
                IllegalArgumentException.class,
                () -> couponService.issueCoupon(couponId, memberId)
        );
        assertThat(e.getMessage()).isEqualTo("존재하지 않는 쿠폰입니다.");

        // 아무 작업도 더 진행되면 안 됨
        verifyNoInteractions(fcsUtil);
        verify(customCouponRepository, never()).updateCouponQuantity(anyLong());
        verify(memberCouponRepository, never()).save(any());
    }

    @Test
    void issueCoupon_동시에_여러_사용자_접근시_update와_save가_요청수만큼_호출된다() throws InterruptedException {
        // given
        int count = 100;
        Long couponId = 1L;
        Long memberId = 1L;

        Coupon coupon = mock(Coupon.class);
        Member member = mock(Member.class);

        // 1) 쿠폰 존재 + 미만료
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(coupon.getExpiresAt()).thenReturn(LocalDateTime.now().plusHours(1));

        // 2) 순번은 동시 호출이라도 그냥 1 만 리턴해도 상관 없음 (값 검증 안 하니까)
        when(fcsUtil.nextOrder(couponId)).thenReturn(1L);

        // 3) 재고 증가 쿼리 항상 성공했다고 가정
        when(customCouponRepository.updateCouponQuantity(couponId)).thenReturn(1L);

        // 4) save 에 사용할 레퍼런스 + save 리턴 값
        when(couponRepository.getReferenceById(couponId)).thenReturn(coupon);
        when(memberRepository.getReferenceById(memberId)).thenReturn(member);
        when(memberCouponRepository.save(any(MemberCoupon.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(count);

        // when
        for (int i = 0; i < count; i++) {
            executorService.submit(() -> {
                try {
                    couponService.issueCoupon(couponId, memberId);
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean finished = latch.await(10, TimeUnit.SECONDS);
        executorService.shutdown();

        // then
        assertThat(finished).isTrue();

        verify(customCouponRepository, times(count)).updateCouponQuantity(couponId);
        verify(memberCouponRepository, times(count)).save(any(MemberCoupon.class));
    }

    // ====================== FCS 유틸(nextOrder) 테스트 ======================

    @Test
    void nextOrder_단일_스레드에서는_1부터_순차적으로_증가한다() {
        // given
        Long couponId = 1L;
        FCSUtil fcsUtil = new ConcurrentFCSUtil();

        // when
        long first  = fcsUtil.nextOrder(couponId);
        long second = fcsUtil.nextOrder(couponId);
        long third  = fcsUtil.nextOrder(couponId);

        // then
        assertThat(first).isEqualTo(1L);
        assertThat(second).isEqualTo(2L);
        assertThat(third).isEqualTo(3L);
    }

    @Test
    void nextOrder_동시호출에도_중복없이_1부터_N까지_모두_한번씩_발급된다() throws Exception {
        // given
        Long couponId = 1L;
        int requestCount = 50;
        int threadPoolSize = 10;
        FCSUtil fcsUtil = new ConcurrentFCSUtil();

        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(requestCount);

        List<Long> results = Collections.synchronizedList(new ArrayList<>());

        // when
        for (int i = 0; i < requestCount; i++) {
            executor.submit(() -> {
                try {
                    start.await(); // 출발 신호 기다렸다가
                    long order = fcsUtil.nextOrder(couponId);
                    results.add(order);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }

        long startMillis = System.currentTimeMillis();
        start.countDown(); // 모든 스레드 동시에 출발
        boolean finished = done.await(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - startMillis;
        System.out.println("동시 nextOrder 테스트 소요 시간 = " + elapsed + "ms");

        executor.shutdown();

        // then
        assertThat(finished).isTrue();
        assertThat(results).hasSize(requestCount);

        List<Long> sorted = new ArrayList<>(results);
        Collections.sort(sorted);

        assertThat(sorted).containsExactly(
                LongStream.rangeClosed(1, requestCount)
                        .boxed()
                        .toArray(Long[]::new)
        );
    }

    @Test
    void nextOrder_쿠폰별로_카운터가_독립적으로_유지된다() {
        // given
        Long couponA = 1L;
        Long couponB = 2L;
        FCSUtil fcsUtil = new ConcurrentFCSUtil();

        // when
        long a1 = fcsUtil.nextOrder(couponA); // 1
        long a2 = fcsUtil.nextOrder(couponA); // 2
        long b1 = fcsUtil.nextOrder(couponB); // 1
        long a3 = fcsUtil.nextOrder(couponA); // 3
        long b2 = fcsUtil.nextOrder(couponB); // 2

        // then
        assertThat(a1).isEqualTo(1L);
        assertThat(a2).isEqualTo(2L);
        assertThat(a3).isEqualTo(3L);

        assertThat(b1).isEqualTo(1L);
        assertThat(b2).isEqualTo(2L);
    }
}