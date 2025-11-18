package com.ssafy.agzak.domain.coupon.service;

import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponRequest;
import com.ssafy.agzak.domain.coupon.dto.response.CouponIssueResultResponse;
import com.ssafy.agzak.domain.coupon.dto.response.CouponResponse;
import com.ssafy.agzak.domain.coupon.entity.Coupon;
//import com.ssafy.agzak.domain.coupon.entity.CouponEventCounter;
import com.ssafy.agzak.domain.coupon.entity.MemberCoupon;
import com.ssafy.agzak.domain.coupon.repository.*;
import com.ssafy.agzak.domain.coupon.port.CouponIssueOrderPort;
import com.ssafy.agzak.domain.event.repository.EventRepository;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponTypeRepository couponTypeRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberRepository memberRepository;
    private final CustomCouponRepository customCouponRepository;
//    private final CouponEventCounterRepository couponEventCounterRepository;
    private final CouponIssueOrderPort couponIssueOrderPort;
    private final EventRepository eventRepository;

    public CouponService(
            CouponRepository couponRepository,
            CouponTypeRepository couponTypeRepository,
            MemberCouponRepository memberCouponRepository,
            MemberRepository memberRepository,
            CustomCouponRepository customCouponRepository,
            @Qualifier("redisCouponIssueOrderAdapter")
            CouponIssueOrderPort couponIssueOrderPort, EventRepository eventRepository
    ) {
        this.couponRepository = couponRepository;
        this.couponTypeRepository = couponTypeRepository;
        this.memberCouponRepository = memberCouponRepository;
        this.memberRepository = memberRepository;
        this.customCouponRepository = customCouponRepository;
        this.couponIssueOrderPort = couponIssueOrderPort;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public void createCoupon(CreateCouponRequest request) {
        couponRepository.save(
                Coupon.builder()
                        .couponType(
                                couponTypeRepository.getReferenceById(request.couponTypeId()
                        ))
                        .event(eventRepository.getReferenceById(request.eventId()))
                        .description(request.description())
                        .totalQuantity(request.totalQuantity())
                        .build()
        );
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getCouponsByEvent(Long eventId) {
        return couponRepository.findByEvent_EventId(eventId)
                .stream()
                .map(CouponResponse::from)
                .toList();
    }

    @Transactional
    public void expireCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
        coupon.expire();
        couponIssueOrderPort.cleanCache(couponId);
    }


    // 기본 버전: 동시성 문제로 인해 발급 수량 초과 가능
//    @Transactional
//    public void issueCoupon(Long couponId, Long memberId) {
//        Coupon coupon = couponRepository.findById(couponId)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
//        if(coupon.getTotalQuantity() <= coupon.getIssuedQuantity()) {
//            throw new IllegalArgumentException("발급 가능한 쿠폰 수량이 없습니다.");
//        }
//        coupon.issue();
//        memberCouponRepository.save(
//                MemberCoupon.builder()
//                        .coupon(coupon)
//                        .member(memberRepository.getReferenceById(memberId))
//                        .build()
//        );
//    }

    // synchronized 버전: 동시성 해결 불가
//    @Transactional
//    public synchronized void issueCoupon(Long couponId, Long memberId) {
//        Coupon coupon = couponRepository.findById(couponId)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
//        if(coupon.getTotalQuantity() <= coupon.getIssuedQuantity()) {
//            throw new IllegalArgumentException("발급 가능한 쿠폰 수량이 없습니다.");
//        }
//        coupon.issue();
//        memberCouponRepository.save(
//                MemberCoupon.builder()
//                        .coupon(coupon)
//                        .member(memberRepository.getReferenceById(memberId))
//                        .build()
//        );
//    }

    // 잠금 버전: 동시성 문제 해결, 처리 속도 저하 가능
//    @Transactional
//    public void issueCoupon(Long couponId, Long memberId) {
//        Coupon coupon = customCouponRepository.findByCouponIdForUpdate(couponId)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
//        if(coupon.getTotalQuantity() <= coupon.getIssuedQuantity()) {
//            throw new IllegalArgumentException("발급 가능한 쿠폰 수량이 없습니다.");
//        }
//        coupon.issue();
//        memberCouponRepository.save(
//                MemberCoupon.builder()
//                        .coupon(coupon)
//                        .member(memberRepository.getReferenceById(memberId))
//                        .build()
//        );
//    }

    // atomic update 버전: 동시성 문제 해결, 처리 속도 배타락 시도 대비 향상
//    @Transactional
//    public void issueCoupon(Long couponId, Long memberId) {
//        long updated = customCouponRepository.updateCouponQuantity(couponId);
//
//        if (updated == 0) {
//            throw new IllegalArgumentException("발급 가능한 쿠폰 수량이 없습니다.");
//        }
//
//        memberCouponRepository.save(
//                MemberCoupon.builder()
//                        .coupon(couponRepository.getReferenceById(couponId))
//                        .member(memberRepository.getReferenceById(memberId))
//                        .build()
//        );
//    }

//    // atomic update 버전 + 발급 순서 반환: 발급 순서 반환 로직 데드록 발생
//    @Transactional
//    public CouponIssueResultResponse issueCoupon(Long couponId, Long memberId) {
//
//        int inc = couponEventCounterRepository.increaseAttemptCount(couponId);
//
//        if (inc == 0) {
//            couponEventCounterRepository.save(
//                    CouponEventCounter.builder()
//                            .coupon(couponRepository.getReferenceById(couponId))
//                            .build()
//            );
//        }
//
//        int order = couponEventCounterRepository.getAttemptCount(couponId);
//        long updated = customCouponRepository.updateCouponQuantity(couponId);
//
//        if (updated == 0) {
//            return CouponIssueResultResponse.failDueToSoldOut(order);
//        }
//
//        MemberCoupon saved = memberCouponRepository.save(
//                MemberCoupon.builder()
//                        .coupon(couponRepository.getReferenceById(couponId))
//                        .member(memberRepository.getReferenceById(memberId))
//                        .build()
//        );
//
//        return CouponIssueResultResponse.success(saved.getMemberCouponId(), order);
//    }

    // atomic update 버전 + Concurrent FCSUtil 발급 순서 반환: 발급 순서 반환 로직 데드록 해결
    @Transactional
    public CouponIssueResultResponse issueCoupon(Long couponId, Long memberId) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));

        if (coupon.getExpiresAt() != null) {
            throw new IllegalArgumentException("만료된 쿠폰입니다.");
        }

        long order = couponIssueOrderPort.nextOrder(couponId);
        long updated = customCouponRepository.updateCouponQuantity(couponId);

        if (updated == 0) {
            return CouponIssueResultResponse.failDueToSoldOut(order);
        }

        MemberCoupon saved = memberCouponRepository.save(
                MemberCoupon.builder()
                        .coupon(couponRepository.getReferenceById(couponId))
                        .member(memberRepository.getReferenceById(memberId))
                        .build()
        );

        return CouponIssueResultResponse.success(saved.getMemberCouponId(), order);
    }

}
