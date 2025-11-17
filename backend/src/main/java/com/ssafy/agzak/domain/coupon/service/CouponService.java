package com.ssafy.agzak.domain.coupon.service;

import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponRequest;
import com.ssafy.agzak.domain.coupon.entity.Coupon;
import com.ssafy.agzak.domain.coupon.entity.MemberCoupon;
import com.ssafy.agzak.domain.coupon.repository.CouponRepository;
import com.ssafy.agzak.domain.coupon.repository.CouponTypeRepository;
import com.ssafy.agzak.domain.coupon.repository.MemberCouponRepository;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponTypeRepository couponTypeRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public void createCoupon(CreateCouponRequest request) {
        couponRepository.save(
                Coupon.builder()
                        .couponType(
                                couponTypeRepository.getReferenceById(request.couponTypeId()
                        ))
                        .description(request.description())
                        .totalQuantity(request.totalQuantity())
                        .build()
        );
    }

    @Transactional
    public void expireCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
        coupon.expire();
    }

    @Transactional
    public void issueCoupon(Long couponId, Long memberId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
        if(coupon.getTotalQuantity() <= coupon.getIssuedQuantity()) {
            throw new IllegalArgumentException("발급 가능한 쿠폰 수량이 없습니다.");
        }
        coupon.issue();
        memberCouponRepository.save(
                MemberCoupon.builder()
                        .coupon(coupon)
                        .member(memberRepository.getReferenceById(memberId))
                        .build()
        );
    }
}
