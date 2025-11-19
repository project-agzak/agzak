package com.ssafy.agzak.domain.coupon.dto.request;

public record CreateCouponRequest(
        Long eventId,
        Long couponTypeId,
        String description,
        Integer totalQuantity
) {
}
