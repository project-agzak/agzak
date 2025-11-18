package com.ssafy.agzak.domain.coupon.controller;

import com.ssafy.agzak.domain.coupon.dto.response.CouponIssueResultResponse;
import com.ssafy.agzak.domain.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/coupons")
@Validated
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/issue/{couponId}/members/{memberId}")
    public ResponseEntity<CouponIssueResultResponse> issueCoupon(@PathVariable @Valid Long couponId,
                                                                 @PathVariable @Valid Long memberId) {

        return ResponseEntity.ok(
                couponService.issueCoupon(couponId, memberId)
        );
    }
}
