package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponRequest;
import com.ssafy.agzak.domain.coupon.dto.request.CreateCouponTypeRequest;
import com.ssafy.agzak.domain.coupon.dto.response.CouponIssueResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "쿠폰", description = "쿠폰 관련 API")
public interface CouponApiDocs {

    @Operation(
            summary = "쿠폰 생성",
            description = "새로운 쿠폰을 생성합니다."
    )
    public ResponseEntity<Void> createCoupon(@RequestBody @Valid CreateCouponRequest request);
    @Operation(
            summary = "쿠폰 타입 생성",
            description = "새로운 쿠폰 타입을 생성합니다."
    )
    public ResponseEntity<Void> createCouponType(@RequestBody @Valid CreateCouponTypeRequest request);
    @Operation(
            summary = "쿠폰 타입 삭제",
            description = "기존 쿠폰 타입을 삭제합니다."
    )
    public ResponseEntity<Void> deleteCouponType(@PathVariable @Valid String typeName);
    @Operation(
            summary = "쿠폰 발급",
            description = "회원에게 쿠폰을 발급합니다."
    )
    public ResponseEntity<CouponIssueResultResponse> issueCoupon(@PathVariable @Valid Long couponId,
                                                                 @PathVariable @Valid Long memberId);
    @Operation(
            summary = "쿠폰 만료 처리",
            description = "쿠폰을 만료 처리합니다."
    )
    public ResponseEntity<Void> expireCoupon(@PathVariable @Valid Long couponId);
}
