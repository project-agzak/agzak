package com.ssafy.agzak.domain.coupon.service;

import com.ssafy.agzak.domain.coupon.dto.response.CouponIssueResultResponse;
import com.ssafy.agzak.domain.coupon.entity.Coupon;
import com.ssafy.agzak.domain.coupon.entity.CouponType;
import com.ssafy.agzak.domain.coupon.repository.CouponEventCounterRepository;
import com.ssafy.agzak.domain.coupon.repository.CouponRepository;
import com.ssafy.agzak.domain.coupon.repository.CouponTypeRepository;
import com.ssafy.agzak.domain.coupon.repository.MemberCouponRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

@SpringBootTest
@ActiveProfiles("test")
public class CouponServiceAutowiredTest {
    @Autowired
    CouponService couponService;

    @Autowired
    CouponRepository couponRepository;

    @Autowired
    CouponTypeRepository couponTypeRepository;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    MemberCouponRepository memberCouponRepository;

    @Autowired
    CouponEventCounterRepository couponEventCounterRepository;

    @BeforeEach
    void setUp() {
        memberCouponRepository.deleteAll();
        couponRepository.deleteAll();
        couponTypeRepository.deleteAll();
        memberRepository.deleteAll();
        couponEventCounterRepository.deleteAll();
    }

    @Test
    void issueCoupon_요청이_많아도_재고가_초과되지_않는지_검증() throws InterruptedException {
        // given
        int totalQuantity = 100;
        int requestCount  = 1000;

        Member member = memberRepository.save(
                Member.builder()
                        .email("EMAIL@email.com")
                        .password("password123!")
                        .nickname("nickname")
                        .gender(Member.Gender.MALE)
                        .birthDate(LocalDate.now())
                        .birthTime(LocalTime.now())
                        .birthCity("Seoul")
                        .latitude(37.5665)
                        .longitude(126.9780)
                        .status(Member.MemberStatus.ACTIVE)
                        .build()
        );

        CouponType couponType = couponTypeRepository.save(
                CouponType.builder()
                        .typeName("동시접근테스트쿠폰타입")
                        .build()
        );

        Coupon coupon = couponRepository.save(
                Coupon.builder()
                        .couponType(couponType)
                        .description("동시접근 테스트 쿠폰")
                        .totalQuantity(totalQuantity)
                        .build()
        );

        ExecutorService executorService = Executors.newFixedThreadPool(20);
        CountDownLatch latch = new CountDownLatch(requestCount);

        AtomicInteger success = new AtomicInteger();
        AtomicInteger fail    = new AtomicInteger();

        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();
        long startTime = System.currentTimeMillis();

        for (int i = 0; i < requestCount; i++) {
            executorService.submit(() -> {
                try {
                    couponService.issueCoupon(coupon.getCouponId(), member.getMemberId());
                    success.incrementAndGet();
                } catch (Exception e) {
                    fail.incrementAndGet();
                    errors.add(e);
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executorService.shutdown();

        long endTime = System.currentTimeMillis();
        System.out.println("총 소요 시간: " + (endTime - startTime) + "ms");

        // when
        long savedCount = memberCouponRepository.count();
        int issuedQuantity = couponRepository.findById(coupon.getCouponId())
                .orElseThrow()
                .getIssuedQuantity();

        System.out.println("success = " + success.get());
        System.out.println("fail    = " + fail.get());
        System.out.println("savedCount = " + savedCount);
        System.out.println("issuedQuantity = " + issuedQuantity);

        // 예외 요약 출력
        System.out.println("총 실패 수 = " + errors.size());

        // then
        assertAll(
                () -> assertThat(savedCount)
                        .as("member_coupon 행 개수는 재고(총 수량)를 초과하면 안 된다")
                        .isLessThanOrEqualTo(totalQuantity),
                () -> assertThat(issuedQuantity)
                        .as("쿠폰 issuedQuantity는 재고(총 수량)를 초과하면 안 된다")
                        .isLessThanOrEqualTo(totalQuantity),
                () -> assertThat(success.get() + fail.get())
                        .as("성공 + 실패 = 전체 요청 수")
                        .isEqualTo(requestCount)
        );
    }

    @Test
    void issueCoupon_요청이_많아도_재고가_초과되지_않는지_검증2() throws InterruptedException {
        // given
        int totalQuantity = 1;
        int requestCount  = 10;

        Member member = memberRepository.save(
                Member.builder()
                        .email("EMAIL@email.com")
                        .password("password123!")
                        .nickname("nickname")
                        .gender(Member.Gender.MALE)
                        .birthDate(LocalDate.now())
                        .birthTime(LocalTime.now())
                        .birthCity("Seoul")
                        .latitude(37.5665)
                        .longitude(126.9780)
                        .status(Member.MemberStatus.ACTIVE)
                        .build()
        );

        CouponType couponType = couponTypeRepository.save(
                CouponType.builder()
                        .typeName("동시접근테스트쿠폰타입")
                        .build()
        );

        Coupon coupon = couponRepository.save(
                Coupon.builder()
                        .couponType(couponType)
                        .description("동시접근 테스트 쿠폰")
                        .totalQuantity(totalQuantity)
                        .build()
        );

        int threadPoolSize = 20;
        ExecutorService executorService = Executors.newFixedThreadPool(threadPoolSize);

        // 동시에 쏘기 위한 배리어들
        CountDownLatch ready = new CountDownLatch(requestCount);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done  = new CountDownLatch(requestCount);

        AtomicInteger success = new AtomicInteger();
        AtomicInteger fail    = new AtomicInteger();
        ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

        // when
        for (int i = 0; i < requestCount; i++) {
            executorService.submit(() -> {
                try {
                    // 준비 완료 알림
                    ready.countDown();
                    // 모두 준비될 때까지 대기
                    start.await();

                    couponService.issueCoupon(coupon.getCouponId(), member.getMemberId());
                    success.incrementAndGet();
                } catch (Exception e) {
                    fail.incrementAndGet();
                    errors.add(e);
                } finally {
                    done.countDown();
                }
            });
        }

        // 모든 작업자가 준비될 때까지 대기
        ready.await();

        long startTime = System.currentTimeMillis();

        // 동시에 출발
        start.countDown();

        // 최대 30초까지만 기다리고, 그 안에 끝나야 테스트 통과
        boolean finishedInTime = done.await(30, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();

        executorService.shutdown();

        System.out.println("총 소요 시간: " + (endTime - startTime) + "ms");
        System.out.println("success = " + success.get());
        System.out.println("fail    = " + fail.get());

        // when (DB 상태 조회)
        long savedCount = memberCouponRepository.count();
        int issuedQuantity = couponRepository.findById(coupon.getCouponId())
                .orElseThrow()
                .getIssuedQuantity();

        System.out.println("savedCount = " + savedCount);
        System.out.println("issuedQuantity = " + issuedQuantity);
        System.out.println("총 실패 수 = " + errors.size());
        errors.forEach(Throwable::printStackTrace);

        // then
        assertAll(
                () -> assertThat(finishedInTime)
                        .as("모든 요청이 타임아웃 없이 처리되어야 합니다.")
                        .isTrue(),
                () -> assertThat(savedCount)
                        .as("member_coupon 행 개수는 재고(총 수량)를 초과하면 안 된다")
                        .isLessThanOrEqualTo(totalQuantity),
                () -> assertThat(issuedQuantity)
                        .as("쿠폰 issuedQuantity는 재고(총 수량)를 초과하면 안 된다")
                        .isLessThanOrEqualTo(totalQuantity),
                () -> assertThat(success.get() + fail.get())
                        .as("성공 + 실패 = 전체 요청 수")
                        .isEqualTo(requestCount)
        );
    }


    @Test
    void issueCoupon_동시_요청에서도_재고초과없이_순번과_발급결과가_일관된다() throws Exception {
        // ────────────── given ──────────────
        int totalQuantity = 50;
        int requestCount  = 200;
        int threadPoolSize = 20;


        // 테스트용 멤버 하나 (Member 필수 필드는 실제 엔티티에 맞게 수정)
        Member member = memberRepository.save(
                Member.builder()
                        .email("test@example.com")
                        .password("password123!")
                        .nickname("tester")
                        .gender(Member.Gender.MALE)
                        .birthDate(LocalDate.of(1995, 1, 1))
                        .birthTime(LocalTime.of(12, 0))
                        .birthCity("Seoul")
                        .latitude(37.5665)
                        .longitude(126.9780)
                        .status(Member.MemberStatus.ACTIVE)
                        .build()
        );

        // 쿠폰 타입
        CouponType couponType = couponTypeRepository.save(
                CouponType.builder()
                        .typeName("동시성테스트쿠폰타입")
                        .build()
        );

        // 재고가 totalQuantity인 쿠폰
        Coupon coupon = couponRepository.save(
                Coupon.builder()
                        .couponType(couponType)
                        .description("동시성 테스트 쿠폰")
                        .totalQuantity(totalQuantity)
                        .build()
        );

        Long couponId = coupon.getCouponId();
        Long memberId = member.getMemberId();

        // 동시 요청 실행 준비
        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);

        CountDownLatch ready  = new CountDownLatch(requestCount);
        CountDownLatch start  = new CountDownLatch(1);
        CountDownLatch done   = new CountDownLatch(requestCount);

        // 응답/에러 모으는 컨테이너
        List<CouponIssueResultResponse> responses =
                Collections.synchronizedList(new ArrayList<>());
        List<Throwable> errors =
                Collections.synchronizedList(new ArrayList<>());

        // ────────────── when (동시에 쏘기) ──────────────
        for (int i = 0; i < requestCount; i++) {
            executor.submit(() -> {
                try {
                    ready.countDown();   // "나 준비됐음"
                    start.await();       // 모두 준비될 때까지 대기

                    // 실제 쿠폰 발급 시도
                    CouponIssueResultResponse res =
                            couponService.issueCoupon(couponId, memberId);
                    responses.add(res);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    done.countDown();
                }
            });
        }

        // 모든 스레드가 준비될 때까지 대기
        ready.await();

        long startMillis = System.currentTimeMillis();
        // 동시에 출발!
        start.countDown();

        // 최대 30초까지 기다렸다가, 안 끝나면 실패로 간주
        boolean finishedInTime = done.await(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - startMillis;

        executor.shutdown();

        System.out.println("동시 발급 테스트 소요 시간 = " + elapsed + " ms");
        System.out.println("응답 수 = " + responses.size());
        System.out.println("에러 수 = " + errors.size());

        // ────────────── then: 1. 데드락/타임아웃 없이 끝났는지 ──────────────
        assertThat(finishedInTime)
                .as("모든 요청이 타임아웃 없이 처리되어야 합니다.")
                .isTrue();

        // ────────────── then: 2. 재고 초과 여부 + DB 일관성 ──────────────
        Coupon reloaded = couponRepository.findById(couponId).orElseThrow();

        long issuedQuantity = reloaded.getIssuedQuantity();
        long savedMemberCoupons = memberCouponRepository.count();

        assertThat(issuedQuantity)
                .as("실제 쿠폰의 issuedQuantity는 재고를 초과하면 안 됩니다.")
                .isLessThanOrEqualTo(totalQuantity);

        assertThat(savedMemberCoupons)
                .as("발급된 MemberCoupon 행 개수도 재고를 초과하면 안 됩니다.")
                .isLessThanOrEqualTo(totalQuantity);

        // ────────────── then: 3. 응답 결과와 재고의 관계 ──────────────
        // 응답 중 성공/실패 개수 계산
        long successCount = responses.stream()
                .filter(CouponIssueResultResponse::isSuccess) // 메서드명/필드명은 실제 DTO에 맞게 수정
                .count();

        long failCount = responses.stream()
                .filter(r -> !r.isSuccess())
                .count();

        assertThat(successCount + failCount + errors.size())
                .as("성공 + 실패 + 예외 개수 = 전체 요청 수")
                .isEqualTo(requestCount);

        // 성공한 요청 수는 재고와 같아야 한다 (테스트 설계 상)
        assertThat(successCount)
                .as("재고 개수와 실제 성공 발급 수가 같아야 합니다.")
                .isEqualTo(totalQuantity);

        // DB의 issuedQuantity, MemberCoupon 개수도 성공 수와 같아야 일관
        assertThat(issuedQuantity).isEqualTo(successCount);
        assertThat(savedMemberCoupons).isEqualTo(successCount);

        // ────────────── then: 4. order 값 검증 (선착순 로직) ──────────────
        // order 값을 꺼내기 위한 람다 (필드/메서드 이름에 맞게 수정)
        java.util.function.ToIntFunction<CouponIssueResultResponse> getOrder =
                r -> r.order(); // 예: r.getOrder() / r.order() 등 실제 구현에 맞게

        // (1) 성공 응답의 order 들
        List<Integer> successOrders = responses.stream()
                .filter(CouponIssueResultResponse::isSuccess)
                .map(r -> getOrder.applyAsInt(r))
                .sorted()
                .toList();

        // 성공한 사람들의 order는 정확히 1 ~ totalQuantity 여야 한다.
        List<Integer> expectedSuccessOrders = IntStream.rangeClosed(1, totalQuantity)
                .boxed()
                .toList();

        assertThat(successOrders)
                .as("성공한 요청들의 order는 1 ~ 재고수(totalQuantity)여야 합니다.")
                .containsExactlyElementsOf(expectedSuccessOrders);

        // (2) 실패 응답의 order 들은 모두 totalQuantity 보다 커야 한다.
        responses.stream()
                .filter(r -> !r.isSuccess())
                .forEach(r ->
                        assertThat(getOrder.applyAsInt(r))
                                .as("실패한 요청의 order는 재고수보다 커야 합니다.")
                                .isGreaterThan(totalQuantity)
                );

        // ────────────── then: 5. 전체 시도 카운터 검증 (선택)
        Integer attemptCount = couponEventCounterRepository.getAttemptCount(couponId);
        assertThat(attemptCount)
                .as("쿠폰별 시도 카운터는 전체 요청 수와 같아야 합니다.")
                .isEqualTo(requestCount);
    }

    @Test
    void issueCoupon_동시_요청에서도_재고초과없이_순번과_발급결과가_일관된다2() throws Exception {
        // ────────────── given ──────────────
        int totalQuantity = 50;   // 쿠폰 재고
        int requestCount  = 200;  // 전체 요청 수
        int threadPoolSize = 20;  // 동시에 돌릴 스레드 수

        Member member = memberRepository.save(
                Member.builder()
                        .email("test@example.com")
                        .password("password123!")
                        .nickname("tester")
                        .gender(Member.Gender.MALE)
                        .birthDate(LocalDate.of(1995, 1, 1))
                        .birthTime(LocalTime.of(12, 0))
                        .birthCity("Seoul")
                        .latitude(37.5665)
                        .longitude(126.9780)
                        .status(Member.MemberStatus.ACTIVE)
                        .build()
        );

        CouponType couponType = couponTypeRepository.save(
                CouponType.builder()
                        .typeName("동시성테스트쿠폰타입")
                        .build()
        );

        Coupon coupon = couponRepository.save(
                Coupon.builder()
                        .couponType(couponType)
                        .description("동시성 테스트 쿠폰")
                        .totalQuantity(totalQuantity)
                        .build()
        );

        Long couponId = coupon.getCouponId();
        Long memberId = member.getMemberId();

        // ────────────── 동시 요청 실행 준비 ──────────────
        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        CountDownLatch done = new CountDownLatch(requestCount);

        List<CouponIssueResultResponse> responses =
                Collections.synchronizedList(new ArrayList<>());
        List<Throwable> errors =
                Collections.synchronizedList(new ArrayList<>());

        long startMillis = System.currentTimeMillis();

        // ────────────── when ──────────────
        for (int i = 0; i < requestCount; i++) {
            executor.submit(() -> {
                try {
                    CouponIssueResultResponse res =
                            couponService.issueCoupon(couponId, memberId);
                    responses.add(res);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    done.countDown();
                }
            });
        }

        // 최대 10초까지만 기다리고, 그 안에 끝나야 통과
        boolean finishedInTime = done.await(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - startMillis;

        executor.shutdown();

        System.out.println("동시 발급 테스트 소요 시간 = " + elapsed + " ms");
        System.out.println("응답 수 = " + responses.size());
        System.out.println("에러 수 = " + errors.size());

        // ────────────── then: 1. 데드락/타임아웃 없이 끝났는지 ──────────────
        assertThat(finishedInTime)
                .as("모든 요청이 타임아웃 없이 처리되어야 합니다.")
                .isTrue();

        // ────────────── then: 2. 재고 초과 여부 + DB 일관성 ──────────────
        Coupon reloaded = couponRepository.findById(couponId).orElseThrow();

        long issuedQuantity = reloaded.getIssuedQuantity();
        long savedMemberCoupons = memberCouponRepository.count();

        assertThat(issuedQuantity)
                .as("실제 쿠폰의 issuedQuantity는 재고를 초과하면 안 됩니다.")
                .isLessThanOrEqualTo(totalQuantity);

        assertThat(savedMemberCoupons)
                .as("발급된 MemberCoupon 행 개수도 재고를 초과하면 안 됩니다.")
                .isLessThanOrEqualTo(totalQuantity);

        // ────────────── then: 3. 응답 결과와 재고의 관계 ──────────────
        long successCount = responses.stream()
                .filter(CouponIssueResultResponse::isSuccess)
                .count();

        long failCount = responses.stream()
                .filter(r -> !r.isSuccess())
                .count();

        assertThat(successCount + failCount + errors.size())
                .as("성공 + 실패 + 예외 개수 = 전체 요청 수")
                .isEqualTo(requestCount);

        // 성공한 요청 수는 재고와 같아야 한다 (테스트 설계 상)
        assertThat(successCount)
                .as("재고 개수와 실제 성공 발급 수가 같아야 합니다.")
                .isEqualTo(totalQuantity);

        // DB의 issuedQuantity, MemberCoupon 개수도 성공 수와 같아야 일관
        assertThat(issuedQuantity).isEqualTo(successCount);
        assertThat(savedMemberCoupons).isEqualTo(successCount);

        // ────────────── then: 4. order 값 검증 (선착순 로직) ──────────────
        java.util.function.ToIntFunction<CouponIssueResultResponse> getOrder =
                CouponIssueResultResponse::order; // 메서드명에 맞게 수정

        List<Integer> successOrders = responses.stream()
                .filter(CouponIssueResultResponse::isSuccess)
                .map(r -> getOrder.applyAsInt(r))
                .sorted()
                .toList();

        List<Integer> expectedSuccessOrders = IntStream.rangeClosed(1, totalQuantity)
                .boxed()
                .toList();

        assertThat(successOrders)
                .as("성공한 요청들의 order는 1 ~ 재고수(totalQuantity)여야 합니다.")
                .containsExactlyElementsOf(expectedSuccessOrders);

        responses.stream()
                .filter(r -> !r.isSuccess())
                .forEach(r ->
                        assertThat(getOrder.applyAsInt(r))
                                .as("실패한 요청의 order는 재고수보다 커야 합니다.")
                                .isGreaterThan(totalQuantity)
                );

        // ────────────── then: 5. 전체 시도 카운터 검증 ──────────────
        Integer attemptCount = couponEventCounterRepository.getAttemptCount(couponId);
        assertThat(attemptCount)
                .as("쿠폰별 시도 카운터는 전체 요청 수와 같아야 합니다.")
                .isEqualTo(requestCount);
    }


}
