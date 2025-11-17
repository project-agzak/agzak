package com.ssafy.agzak.domain.coupon.service;

import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponRequest;
import com.ssafy.agzak.domain.coupon.entity.Coupon;
import com.ssafy.agzak.domain.coupon.entity.CouponType;
import com.ssafy.agzak.domain.coupon.repository.CouponRepository;
import com.ssafy.agzak.domain.coupon.repository.CouponTypeRepository;
import com.ssafy.agzak.domain.coupon.repository.MemberCouponRepository;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

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

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(coupon.getTotalQuantity()).thenReturn(10);
        when(coupon.getIssuedQuantity()).thenReturn(5);

        // when
        couponService.issueCoupon(couponId, memberId);

        // then
        verify(coupon).issue();
    }

    @Test
    void issueCoupon_수량초과시_예외() {
        // given
        Long couponId = 1L;
        Long memberId = 1L;
        Coupon coupon = mock(Coupon.class);

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(coupon.getTotalQuantity()).thenReturn(10);
        when(coupon.getIssuedQuantity()).thenReturn(10); // 이미 다 소진된 상태

        // when & then
        IllegalArgumentException e = assertThrows(
                IllegalArgumentException.class,
                () -> couponService.issueCoupon(couponId, memberId)
        );
        assertEquals("발급 가능한 쿠폰 수량이 없습니다.", e.getMessage());
        verify(coupon, never()).issue();
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
        assertEquals("존재하지 않는 쿠폰입니다.", e.getMessage());
    }

    @Test
    void issueCoupon_동시에_여러_사용자_접근시_정상_발급() throws InterruptedException {
        // given
        int count = 100;
        Long couponId = 1L;
        Long memberId = 1L;

        Coupon coupon = Coupon.builder()
                .description("동시접근 테스트 쿠폰")
                .totalQuantity(count)
                .build();

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(memberRepository.getReferenceById(memberId)).thenReturn(null);

        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CountDownLatch countDownLatch = new CountDownLatch(count);
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        // when
        for (int i = 0; i < count; i++) {
            executorService.submit(() -> {
                try {
                    couponService.issueCoupon(couponId, memberId);
                } catch (Throwable t) {
                    errors.add(t);
                }finally {
                    countDownLatch.countDown();
                }
            });
        }

        countDownLatch.await();
        executorService.shutdown();

        // then
        verify(memberCouponRepository, times(count)).save(any());
        assertEquals(count, coupon.getIssuedQuantity());
    }
}