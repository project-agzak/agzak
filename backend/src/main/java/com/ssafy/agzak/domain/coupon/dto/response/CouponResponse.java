package com.ssafy.agzak.domain.coupon.dto.response;

import com.ssafy.agzak.domain.coupon.entity.Coupon;
import com.ssafy.agzak.domain.coupon.entity.CouponType;
import lombok.Builder;

import java.time.LocalDateTime;

public record CouponResponse(
        Long couponId,
        String couponTypeName,
        String description,
        Integer totalQuantity,
        Integer issuedQuantity,
        LocalDateTime createdAt
) {
    @Builder
    public CouponResponse {
    }

    public static CouponResponse from(Coupon coupon) {
        return CouponResponse.builder()
                .couponId(coupon.getCouponId())
                .couponTypeName(coupon.getCouponType().getTypeName())
                .description(coupon.getDescription())
                .totalQuantity(coupon.getTotalQuantity())
                .issuedQuantity(coupon.getIssuedQuantity())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
