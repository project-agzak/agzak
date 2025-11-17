package com.ssafy.agzak.domain.coupon.dto.request;

public record CreateCouponRequest(
        Long couponTypeId,
        String description,
        Integer totalQuantity
) {
}
