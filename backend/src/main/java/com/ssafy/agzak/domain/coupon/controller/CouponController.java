package com.ssafy.agzak.domain.coupon.controller;

import com.ssafy.agzak.docs.CouponApiDocs;
import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponRequest;
import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponTypeRequest;
import com.ssafy.agzak.domain.coupon.dto.response.CouponIssueResultResponse;
import com.ssafy.agzak.domain.coupon.service.CouponService;
import com.ssafy.agzak.domain.coupon.service.CouponTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/coupons")
@Validated
public class CouponController implements CouponApiDocs {

    private final CouponService couponService;
    private final CouponTypeService couponTypeService;

    @PostMapping
    public ResponseEntity<Void> createCoupon(@RequestBody @Valid CreateCouponRequest request) {
        couponService.createCoupon(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/types")
    public ResponseEntity<Void> createCouponType(@RequestBody @Valid CreateCouponTypeRequest request) {
        couponTypeService.createCouponType(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/types/{typeName}")
    public ResponseEntity<Void> deleteCouponType(@PathVariable @Valid String typeName) {
        couponTypeService.deleteCouponType(typeName);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/issue/{couponId}/members/{memberId}")
    public ResponseEntity<CouponIssueResultResponse> issueCoupon(@PathVariable @Valid Long couponId,
                                                                 @PathVariable @Valid Long memberId) {
        return ResponseEntity.ok(
                couponService.issueCoupon(couponId, memberId)
        );
    }

    @PostMapping("/expire/{couponId} ")
    public ResponseEntity<Void> expireCoupon(@PathVariable @Valid Long couponId) {
        couponService.expireCoupon(couponId);
        return ResponseEntity.ok().build();
    }
}
